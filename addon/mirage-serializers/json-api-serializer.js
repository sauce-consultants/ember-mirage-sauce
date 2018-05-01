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


export default JSONAPISerializer.extend({
  /**
   * Define an array of fields in the model to fuzzy search
   *
   * @type {Array}
   */
  searchByFields: A([]),

  extractFilterParams(params) {
    let filters = [];
    for (var key in params) {
      // loop though params and match any that follow the
      // filter[foo] pattern. Then extract foo.
      if (key.substr(0, 6) === 'filter') {
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
  filterResponse(data, filters) {
    // NOTE! to filter by a relationship id it must be included
    // in the requests "include" param. Otherwise this serializer
    // does not include data from that relationship in it's 'data'

    filters.forEach((filter) => {
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
          if (filter.property === 'search' && value) {
            if (this.filterBySearch(record, value)) {
              match = true;
            }
          } else if (value === attribute) {
            match = true;
          } else if (filter.property.endsWith('-id')) {
            let relationship = filter.property.replace('-id', ''),
              path = `relationships.${relationship}.data.id`;
            // Check for a relationship match
            if (value === get(record, path)) {
              match = true;
            }
          }
        })
        return match;
      });
    })
    return data;
  },
  /**
   * Check if the model passes search filter
   *
   * @access protected
   * @param {object}    record Serialised model instance to search
   * @param {string}    term The search term
   * @return {boolean}
   */
  filterBySearch(record, term) {

    const searchFields = get(this, 'searchByFields');

    if (isEmpty(searchFields)) {
      // no search fields - return record
      return true;
    }

    let matched = false;

    searchFields.forEach((field) => {
      const fieldValue = get(record, `attributes.${field}`);

      if (!isEmpty(fieldValue) && fieldValue.search(term) !== -1) {
        matched = true;
      }
    });

    return matched;
  },
  sortResponse(json, sort) {
    // JSON API Sort logic
    // ---
    // Supports one sort param atm...
    // http://jsonapi.org/format/#fetching-sorting
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
      if (this.isAttribute(sort)) {
        let path = this.getAttributePath(sort, data[0]);
        // sort by property
        data = A(data).sortBy(path);
      } else if (this.isRelatedAttribute(sort)) {
        // sort by related
        data = this.sortByIncludedProperty(data, json.included, sort);
      }
      // reverse sort order?
      if (desc) {
        data = data.reverseObjects();
      }
    }
    return data;
  },
  sortByIncludedProperty(data, included, sort) {
    let idPath = this.getRelatedIdPath(sort, data[0]),
      model = this.getRelatedModel(sort),
      attrPath = this.getRelatedAttributePath(sort, data[0]);
    return data.sort((a, b) => {
      const aId = get(a, idPath),
        bId = get(b, idPath),
        aRelated = this.findIncludedModelById(included, model, aId),
        bRelated = this.findIncludedModelById(included, model, bId),
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
  isAttribute(path) {
    return path.split('.').length === 1;
  },
  isRelatedAttribute(path) {
    return path.split('.').length === 2;
  },
  getRelatedIdPath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    const relatedModel = property.split('.')[0];
    // define full path
    const path = `relationships.${relatedModel}.data.id`;

    return path;
  },
  getAttributePath(property, record) {
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
  getRelatedModel(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split('.')[0];
    return property;
  },
  getRelatedAttributePath(property) {
    // ensure param is underscored
    property = dasherize(property);
    // destructure property
    property = property.split('.')[1];
    // define full path
    const path = `attributes.${property}`;

    return path;
  },
  findIncludedModelById(array, model, id) {
    return array.find(function(item) {
      return (get(item, 'type') === pluralize(model) && get(item, 'id') === id);
    })
  },
  findRecordPath(property, record) {
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
  serialize(object, request) {
    // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
    let json = JSONAPISerializer.prototype.serialize.apply(this, arguments);

    // Add metadata, sort parts of the response, etc.

    // Is this an collection response
    if (Array.isArray(json.data)) {

      // Get filter params from request
      let filters = this.extractFilterParams(request.queryParams);
      // Filter data
      json.data = this.filterResponse(json.data, filters);
      // Sort data
      json.data = this.sortResponse(json, request.queryParams.sort);
      // Paginate?
      if (request.queryParams['page[number]'] && request.queryParams['page[size]']) {
        const page = parseInt(request.queryParams['page[number]']);
        const size = parseInt(request.queryParams['page[size]']);

        json = this.paginate(json, page, size);
      }
    }

    //
    return json;
  },
  //
  // PAGINATION
  //
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
  }
});