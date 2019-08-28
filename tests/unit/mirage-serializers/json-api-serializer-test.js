import JsonApiSerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';
import {
  module,
  test
} from 'qunit';
import {
  get
} from '@ember/object';
import {
  pluralize
} from 'ember-inflector';

module('Unit | Mirage Serialize | json api serializer');

// Finds a relationship one level deep
test('it paginates the response', function(assert) {

  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('user', 1, {}, {}),
        generateModel('user', 2, {}, {}),
        generateModel('user', 3, {}, {}),
        generateModel('user', 4, {}, {}),
        generateModel('user', 5, {}, {}),
        generateModel('user', 6, {}, {}),
        generateModel('user', 7, {}, {}),
        generateModel('user', 8, {}, {}),
        generateModel('user', 9, {}, {}),
        generateModel('user', 10, {}, {}),
      ]
    },
    request = {
      queryParams: {
        'page[number]': "1",
        'page[size]': "5",
      }
    },
    result = serializer._serialize(json, request);
  assert.equal(get(result, 'data.length'), 5);
  // assert.equal(get(result, 'id'), 1);
});

function generateModel(type, id, attributes, relationships) {
  return {
    attributes,
    id,
    relationships,
    type: pluralize(type),
  };
}

// function generateRelationship(type, id) {
//   return {
//     data: {
//       id,
//       type: pluralize(type)
//     }
//   };
// }