import {
  JSONAPISerializer
} from 'ember-cli-mirage';
import {
  A
} from '@ember/array';
import {
  isEmpty
} from '@ember/utils';
import {
  get
} from '@ember/object';
import {
  dasherize,
} from '@ember/string';
import {
  pluralize
} from 'ember-inflector';
import Ember from 'ember';
import findNestedRelationship from 'ember-mirage-sauce/utils/find-nested-relationship';
const DEBUG = true;

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
  searchByFields: A([]),

  /**
    Query param name for the search parameter
    _Default: "search"

    @property searchKey
    @default "search"
    @type {string}
   */
  searchKey: 'search',

  /**
    Query param name for the sort parameter
    _Default: "sort"

    @property sortKey
    @default "sort"
    @type {string}
   */
  sortKey: 'sort',

  /**
    Query param name for the filter parameters
    _Default: "filter"

    @property filterKey
    @default "filter"
    @type {string}
   */
  filterKey: 'filter',

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
    this.log("===========");
    this.log("= Serialize");
    // Get filter params from request
    this.log("> json", json);
    let filters = this._extractFilterParams(request.queryParams);
    this.log("> filters", request.queryParams);
    // Filter data
    json.data = this.filterResponse(json, filters);
    // Sort data
    json.data = this.sortResponse(json, get(request.queryParams, get(this, 'sortKey')));
    // Any Hooks?
    const hook = get(this, 'filterHook');
    if (hook) {
      json = hook(json, request);
    }
    // Paginate?
    if (request.queryParams['page[number]'] && request.queryParams['page[size]']) {
      const page = parseInt(request.queryParams['page[number]']);
      const size = parseInt(request.queryParams['page[size]']);

      json = this.paginate(json, page, size);
    }

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
    this.log("= Filter Response");
    let data = json.data
    filters.forEach((filter) => {
      this.log("filter", filter);
      if (get(this, 'ignoreFilters').indexOf(filter.property) !== -1) {
        this.log(`ignoring ${filter.property} filter`);
        return;
      }
      data = data.filter((record) => {
        let match = false;
        filter.property = dasherize(filter.property);
        filter.values.forEach((value) => {
          let attribute = get(record, `attributes.${filter.property}`);

          // Convert bool to string
          if (typeof(attribute) === "boolean") {
            attribute = attribute.toString();
          }

          // Check for an attribute match
          if (filter.property === get(this, 'searchKey') && value) {
            if (this.filterBySearch(record, value)) {
              this.log(`> Filter by search key ${filter.property}`);
              match = true;
            }
          } else if (value === attribute) {
            this.log(`> Filter by attribute ${filter.property}`);
            match = true;
          } else if (filter.property.endsWith('-id')) {
            let relationship = filter.property.replace('-id', ''),
              path = `relationships.${relationship}.data.id`;

            this.log(`> Filter by belongsTo, ${filter.property} : ${path}`);
            // Check for a relationship match
            if (value === get(record, path)) {
              match = true;
            } else {
              this.log(`!- relationship ${relationship} not found`);
            }
          } else if (filter.property.endsWith('-ids')) {
            // Has Many Relationship
            let relationship = filter.property.replace('-ids', ''),
              path = `relationships.${pluralize(relationship)}.data`;

            this.log(`> Filter by hasMany, ${filter.property} : ${path}`);

            // Loop though relationships for a match
            get(record, path).forEach(
              (related) => {
                if (value === get(related, 'id')) {
                  match = true;
                }
              }
            );
          } else if (filter.property.includes('.')) {

            let segments = filter.property.split('.'),
              // last item will be the property
              relationshipProperty = segments[segments.length - 1];
            // check this path exists in the includes property of our response data

            if (relationshipProperty !== "id") {
              relationshipProperty = `attributes.${relationshipProperty}`;
            }

            // find the nested relationship from the included array
            let relationship = findNestedRelationship(record, json.included, filter.property);

            if (relationship) {

              if (get(relationship, relationshipProperty) === value) {
                match = true;
              }
            }
          }
          /*else {
                     this.log(`did not know how to handle ${filter.property} filter`);
                   }*/
        })
        return match;
      });
    })
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

    const searchFields = get(this, 'searchByFields');

    if (isEmpty(searchFields)) {
      // no search fields - return record
      return true;
    }

    let matched = false;

    searchFields.forEach((field) => {
      const fieldValue = get(record, `attributes.${dasherize(field)}`);

      if (!isEmpty(fieldValue) && fieldValue.search(term) !== -1) {
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
      // does this sort param start with "-"
      if (sort.indexOf('-') === 0) {
        // sort decending
        desc = true;
        // remove prefixed '-'
        sort = sort.substring(1);
      }
      // find the sort path
      if (this._isAttribute(sort)) {
        let path = this._getAttributePath(sort, data[0]);
        // sort by property
        data = A(data).sortBy(path);
      } else if (this._isRelatedAttribute(sort)) {
        // sort by related
        data = this._sortByIncludedProperty(data, json.included, sort);
      }
      // reverse sort order?
      if (desc) {
        data = data.reverseObjects();
      }
    }
    return data;
  },
  /**
    Paginate response

    @access protected
    @method paginate
    @param {object} results data to be paginated
    @param {number} page  current page
    @param {number} size  current page size
    @return {object}
   */
  paginate(res, page, size) {
    const slicedResults = (results) => {
      const start = (page - 1) * size;
      const end = start + size;

      return results.slice(start, end);
    };

    const buildMetadata = (results) => {
      return {
        page,
        size,
        total: results.length,
        pages: Math.floor(results.length / size)
      }
    };

    res.meta = buildMetadata(res.data);
    res.data = slicedResults(res.data);

    return res;
  },

  // -------
  // PRIVATE
  // -------

  /**
    Extract filter parameters from the request

    @access private
    @param {Object} params
    @return {Array}
   */
  _extractFilterParams(params) {
    // this.log('= Extract Filter Params', params);
    let filters = A([]);
    for (var key in params) {
      // loop though params and match any that follow the
      // filter[foo] pattern. Then extract foo.
      if (key.substr(0, 6) === get(this, 'filterKey')) {

        let property = key.substr(7, (key.length - 8)),
          value = params[key],
          values = null;

        if (value) {
          values = params[key].split(',');
        }
        if (!isEmpty(values)) {
          filters.pushObject({
            property,
            values
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

    return data.sort((a, b) => {
      const aId = get(a, idPath),
        bId = get(b, idPath),
        aRelated = this._findIncludedModelById(included, model, aId),
        bRelated = this._findIncludedModelById(included, model, bId),
        aVal = get(aRelated, attrPath),
        bVal = get(bRelated, attrPath),
        aNum = parseFloat(aVal),
        bNum = parseFloat(bVal);

      // are they numbers?
      if (isNaN(aVal) || isNaN(bVal)) {
        return aVal < bVal;
      } else {
        return aNum < bNum;
      }
    });
  },
  _isAttribute(path) {
    return path.split('.').length === 1;
  },
  _isRelatedAttribute(path) {
    return path.split('.').length === 2;
  },
  _getRelatedIdPath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    const relatedModel = property.split('.')[0];
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
    if (typeof get(record, path) === 'undefined') {
      Ember.Logger.warn(`Mirage: Could not find path ${path}`);
      Ember.Logger.warn(record);
    }
    return path;
  },
  _getRelatedModel(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split('.')[0];
    return property;
  },
  _getRelatedAttributePath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split('.')[1];
    // define full path
    const path = `attributes.${property}`;

    return path;
  },
  _findIncludedModelById(array, model, id) {
    return array.find(function(item) {
      return (get(item, 'type') === pluralize(model) && get(item, 'id') === id);
    })
  },
  _findRecordPath(property, record) {
    let path;
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    const [a, b] = property.split('.');
    // work out if this is a related property or not
    // and return the key
    if (!isEmpty(b)) {
      path = `relationships.${a}.data.${b}`;
    } else {
      path = `attributes.${a}`;
    }
    // check if path is found
    if (typeof get(record, path) === 'undefined') {
      Ember.Logger.warn(`Mirage: Could not find path ${path}`);
      Ember.Logger.warn(record);
    }
    // warn user else
    return path;
  },
  log(...args) {
    if (DEBUG) {
      window.console.log(...args);
    }
  }
});