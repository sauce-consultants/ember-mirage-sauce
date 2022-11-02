import { JSONAPISerializer } from "miragejs";
import { A } from "@ember/array";
import { isEmpty } from "@ember/utils";
import { get } from "@ember/object";
import { dasherize } from "@ember/string";
import { pluralize } from "ember-inflector";
import findNestedRelationship from "ember-mirage-sauce/utils/find-nested-relationship";
import config from "ember-get-config";

const DEBUG = config["mirage-sauce"] ? config["mirage-sauce"].debug : false;
const DEFAULT_SEARCH_FIELDS = ["email", "name", "firstName", "lastName"];

/**
  A custom JSONAPISerializer that adds sorting, filtering, search &
  pagination to api requests

  ```js
  // in mirage/serializers/application.js
  import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';

  export default JSONAPISerializer.extend({});
  ```

  @class JSONAPISerializer
*/
export default JSONAPISerializer.extend({
  /**
    Define an array of fields in the model to fuzzy search

    @property searchByFields
    @type {Array}
   */
  searchByFields: DEFAULT_SEARCH_FIELDS,

  /**
    Query param name for the search parameter
    _Default: "search"

    @property searchKey
    @default "search"
    @type {string}
   */
  searchKey: "search",

  /**
    Query param name for the sort parameter
    _Default: "sort"

    @property sortKey
    @default "sort"
    @type {string}
   */
  sortKey: "sort",

  /**
    Query param name for the filter parameters
    _Default: "filter"

    @property filterKey
    @default "filter"
    @type {string}
   */
  filterKey: "filter",

  /**
    Define any filter keys to ignore in mirage
    queries
    _Default: []

    @property ignoreFilters
    @default "[]"
    @type {array}
   */
  ignoreFilters: A([]),

  /**
    Define a hook to do your own filtering on a
    request before it is paginated. This closure
    function is passed the json and request objects
    and should return the json object
    _Default: null

    @property filterHook
    @default null
    @type {function}
   */
  filterHook: null,

  /**
    Override the parent serializer to add support for search,
    filter, sort & pagination

    @method serialize
    @access public
    @param {Object} object
    @param {Object} request
    @return {Hash}
   */
  serialize(object, request) {
    // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
    let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);

    // Add metadata, sort parts of the response, etc.

    // Is this a list response
    if (Array.isArray(json.data)) {
      return this._serialize(json, request);
    }

    //
    return json;
  },

  _serialize(json, request) {
    this.log("====================");
    this.log("MIRAGE SAUCE REQUEST");
    this.log("====================");
    // Get filter params from request
    this.log("> Payload data", json);
    this.log("> Request object", request);

    let filters = this._extractFilterParams(request.queryParams);
    // Filter data
    json.data = this.filterResponse(json, filters);
    // Sort data
    json.data = this.sortResponse(json, get(request.queryParams, this.sortKey));
    // Any Hooks?
    const hook = this.filterHook;

    if (hook) {
      json = hook(json, request);
      this.log(`3.  Filter hook called`);
    } else {
      this.log(`3.  Filter hook not set`);
    }
    // Paginate?
    json = this.paginate(json, request);

    return json;
  },

  /**
    Filter responses by filter params

    _NOTE! to filter by a relationship id it must be included
    in the requests "include" param. Otherwise this serializer
    does not include data from that relationship in it's 'data'_

    @access protected
    @method filterResponse
    @param {Array} data
    @param {Array} filters
    @return {Array}
   */
  filterResponse(json, filters) {
    let data = json.data;

    if (filters.length) {
      this.log("1.  Filter the response: filters", filters);

      filters.forEach((filter, index) => {
        this.log(`1.${index}.0 filter`, filter);

        if (this.ignoreFilters.indexOf(filter.property) !== -1) {
          this.log(`1.${index}.1 ignoring ${filter.property} filter`);
          return;
        }

        const attributePath = `attributes.${dasherize(filter.property)}`;

        let logFirst = true;

        data = data.filter((record) => {
          let match = false;

          filter.property = dasherize(filter.property);

          filter.values.forEach((value) => {
            if (logFirst) {
              this.log(`1.${index}.1 Filter ${filter.property}="${value}"`);
            }

            // Check for an attribute match
            // Is this a search term?
            if (filter.property === this.searchKey && value) {
              if (logFirst) {
                this.log(
                  `1.${index}.2 Filter by search key: ${filter.property}="${value}"`
                );
                this.log(
                  `1.${index}.3 Search the followin attributes: ${this.searchByFields.join(
                    ", "
                  )}`
                );
              }
              if (this.filterBySearch(record, value)) {
                match = true;
              }
            }
            // Is this an attribute filter?
            else if (this._isAttributeKey(filter.property, record)) {
              let attribute = get(record, attributePath);

              // Convert bool to string
              if (typeof attribute === "boolean") {
                attribute = attribute.toString();
              }

              // Convert number to string
              if (typeof attribute === "number") {
                attribute = attribute.toString();
              }

              if (logFirst) {
                this.log(`1.${index}.2 Filter by attribute ${filter.property}`);
              }

              if (value === attribute) {
                match = true;
              }
            }
            // Is this a related belongs to id?
            else if (filter.property.endsWith("-id")) {
              let relationship = filter.property.replace("-id", ""),
                path = `relationships.${relationship}.data.id`;

              if (logFirst) {
                this.log(
                  `1.${index}.2 Filter by "${filter.property}" is a belongsTo relationship. Path: ${path}`
                );
              }

              // check the related model is present in the response
              if (this._hasIncludedRelationship(relationship, json.included)) {
                // Check for a relationship match
                if (parseInt(value) === parseInt(get(record, path))) {
                  match = true;
                }
              } else {
                if (logFirst) {
                  this.log(
                    `1.${index}.3 There were no "${relationship}" models found in the includes response! Did you include them in your request?`
                  );
                }
              }
            }
            // Is this a related hasMany to id(s)?
            else if (filter.property.endsWith("-ids")) {
              // Has Many Relationship
              let relationship = filter.property.replace("-ids", ""),
                path = `relationships.${pluralize(relationship)}.data`;

              if (logFirst) {
                this.log(
                  `1.${index}.2 Filter by "${filter.property}" is a hasMany relationship. Path: ${path}`
                );
              }

              // check the related model is present in the response
              if (this._hasIncludedRelationship(relationship, json.included)) {
                // Loop though relationships for a match
                get(record, path).forEach((related) => {
                  if (parseInt(value) === parseInt(related.id)) {
                    match = true;
                  }
                });
              } else {
                if (logFirst) {
                  this.log(
                    `1.${index}.3 There were no "${relationship}" models found in the includes response! Did you include them in your request?`
                  );
                }
              }
            }
            // Is this a related attribute?
            else if (filter.property.includes(".")) {
              let segments = filter.property.split("."),
                // last item will be the property
                relationshipProperty = segments[segments.length - 1];
              // check this path exists in the includes property of our response data

              if (relationshipProperty !== "id") {
                relationshipProperty = `attributes.${relationshipProperty}`;
              }

              // find the nested relationship from the included array
              let relationship = findNestedRelationship(
                record,
                json.included,
                filter.property
              );

              if (logFirst) {
                this.log(
                  `1.${index}.2 Filter by "${filter.property}" is a relationship attribute. Path: "${relationshipProperty}"`
                );
              }

              if (relationship) {
                if (get(relationship, relationshipProperty) == value) {
                  match = true;
                }
              }
            } else {
              if (logFirst) {
                this.log(
                  `1.${index}.2 Filter did not know how to handle "${filter.property}" ${record.id} so it was ignored`
                );
              }
              match = true;
            }
          });

          logFirst = false;

          return match;
        });
      });
    } else {
      this.log("1.  Filter the response: No filters set");
    }
    return data;
  },

  /**
    Check if the model passes search filter

    @access protected
    @method filterBySearch
    @param {object}    record Serialised model instance to search
    @param {string}    term The search term
    @return {boolean}
   */
  filterBySearch(record, term) {
    const searchFields = this.searchByFields;

    if (isEmpty(searchFields)) {
      // no search fields - return record
      return true;
    }

    let matched = false;

    searchFields.forEach((field) => {
      const fieldValue = get(record, `attributes.${dasherize(field)}`);

      if (
        !isEmpty(fieldValue) &&
        fieldValue.toLowerCase().search(term.toLowerCase()) !== -1
      ) {
        matched = true;
      }
    });

    return matched;
  },

  /**
    Order responses by sort param

    _Supports one sort param atm..._
    http://jsonapi.org/format/#fetching-sorting

    @access protected
    @method sortResponse
    @param {Array} data
    @param {Array} filters
    @return {Array}
   */
  sortResponse(json, sort) {
    let desc = false,
      data = json.data;

    if (sort && data.length > 0) {
      this.log("2.  Sort the response", sort);

      // does this sort param start with "-"
      if (sort.indexOf("-") === 0) {
        // sort decending
        desc = true;
        // remove prefixed '-'
        sort = sort.substring(1);
        this.log("2.0 Sort direction: descending");
      } else {
        this.log("2.0 Sort direction: ascending");
      }

      // find the sort path
      if (this._isAttribute(sort)) {
        let path = this._getAttributePath(sort, data[0]);

        this.log(`2.1 Sort by attribute "${sort}". Path:`);
        this.log(`2.2 Sort by path "${path}"`);
        // sort by property
        data = A(data).sortBy(path);
      } else if (this._isRelatedAttribute(sort)) {
        this.log(`2.1 Sort by related attribute "${sort}".`);

        // sort by related
        data = this._sortByIncludedProperty(data, json.included, sort);
      }

      // reverse sort order?
      if (desc) {
        data = A(data).reverseObjects();
      }
    } else {
      this.log("2.  Sort the response: No sort defined");
    }
    return data;
  },

  /**
    Paginate response

    @access protected
    @method paginate
    @param {object} results data to be paginated
    @param {object} request request object
    @return {object}
   */
  paginate(res, request) {
    if (
      request.queryParams["page[number]"] &&
      request.queryParams["page[size]"]
    ) {
      const page = parseInt(request.queryParams["page[number]"]),
        size = parseInt(request.queryParams["page[size]"]),
        total = res ? res.data.length : 0,
        pages = Math.ceil(total / size);

      this.log(`4.  Pagination the response page "${page}" size "${size}"`);

      res.data = this._sliceResults(res.data, page, size);
      res.meta = this._buildMetadata(page, size, total, pages);

      return res;
    } else {
      this.log(`4.  Pagination not set`);
      return res;
    }
  },

  // -------
  // PRIVATE
  // -------

  _sliceResults(results, page, size) {
    const start = (page - 1) * size;
    const end = start + size;

    this.log(`3.0 total results: ${results.length}`);
    this.log(`3.1 slice results at index: ${start} - ${end}`);
    return results.slice(start, end);
  },

  _buildMetadata(page, size, total, pages) {
    this.log(`3.2 total pages: ${pages}`);

    return {
      page,
      size,
      total,
      pages,
    };
  },

  /**
    Extract filter parameters from the request

    @access private
    @param {Object} params
    @return {Array}
   */
  _extractFilterParams(params) {
    let filters = A([]);
    for (var key in params) {
      // loop though params and match any that follow the
      // filter[foo] pattern. Then extract foo.
      if (key.substr(0, 6) === this.filterKey) {
        let property = key.substr(7, key.length - 8),
          value = params[key],
          values = null;

        if (value) {
          // make sure it's a string before we split it
          values = (value + "").split(",");
        }
        if (!isEmpty(values)) {
          filters.pushObject({
            property,
            values,
          });
        }
      }
    }
    return filters;
  },

  /**
    Sort models by a related property

    @access private
    @param {Array} data       Array of serialized models to sort
    @param {Array} included   Collection of included serialized models
    @param {string} sort      Sort property
    @return {Array}
   */
  _sortByIncludedProperty(data, included, sort) {
    let idPath = this._getRelatedIdPath(sort, data[0]),
      model = this._getRelatedModel(sort),
      attrPath = this._getRelatedAttributePath(sort, data[0]);

    this.log(`2.2 Sort by path of included model "${model}" "${attrPath}"`);

    let logFirst = true;

    return data.sort((a, b) => {
      const aId = get(a, idPath),
        bId = get(b, idPath),
        aRelated = this._findIncludedModelById(included, model, aId),
        bRelated = this._findIncludedModelById(included, model, bId);

      // Bale if we didnt find a related model
      if (!aRelated || !bRelated) {
        this.log(`2.3 Couldnt find related model ${model} in response`);
        return 0;
      }

      let aVal = get(aRelated, attrPath),
        bVal = get(bRelated, attrPath);

      // are they numbers?
      if (!isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal))) {
        if (logFirst) {
          this.log(`2.3 Sort by values as numbers`);
          logFirst = false;
        }

        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else {
        if (logFirst) {
          this.log(`2.3 Sort by by values as strings`);
          logFirst = false;
        }
      }

      if (aVal > bVal) {
        return 1;
      } else if (aVal < bVal) {
        return -1;
      } else {
        return 0;
      }
    });
    // return data;
  },

  _isAttribute(path) {
    return path.split(".").length === 1;
  },

  _isAttributeKey(attribute, record) {
    return Object.keys(record.attributes).includes(attribute);
  },

  _hasIncludedRelationship(model, included) {
    return A(included).filterBy("type", pluralize(model)).length > 0;
  },

  _isRelatedAttribute(path) {
    return path.split(".").length === 2;
  },

  _getRelatedIdPath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    const relatedModel = property.split(".")[0];
    // define full path
    const path = `relationships.${relatedModel}.data.id`;

    return path;
  },

  _getAttributePath(property, record) {
    // ensure param is underscored
    property = dasherize(property);
    // define full path
    const path = `attributes.${property}`;
    // check if path is found
    if (typeof get(record, path) === "undefined") {
      this.log(`Mirage: Could not find path ${path}`);
      this.log(record);
    }
    return path;
  },

  _getRelatedModel(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split(".")[0];
    return property;
  },

  _getRelatedAttributePath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split(".")[1];
    // define full path
    const path = `attributes.${property}`;

    return path;
  },

  _findIncludedModelById(array, model, id) {
    return array.find(function (item) {
      return item.type === pluralize(model) && item.id === id;
    });
  },

  _findRecordPath(property, record) {
    let path;
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    const [a, b] = property.split(".");
    // work out if this is a related property or not
    // and return the key
    if (!isEmpty(b)) {
      path = `relationships.${a}.data.${b}`;
    } else {
      path = `attributes.${a}`;
    }
    // check if path is found
    if (typeof get(record, path) === "undefined") {
      this.log(`Mirage: Could not find path ${path}`);
      this.log(record);
    }
    // warn user else
    return path;
  },

  log(...args) {
    if (DEBUG) {
      window.console.log(...args);
    }
  },
});
