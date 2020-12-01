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
        'page[number]': '1',
        'page[size]': '5',
      }
    },
    result = serializer._serialize(json, request);
  assert.equal(get(result, 'data.length'), 5);
  // assert.equal(get(result, 'id'), 1);
});

test('it searches the response', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  serializer.searchByFields = ['title'];

  let json = {
      data: [
        generateModel('post', 1, {
          'title': 'foo'
        }, {}),
        generateModel('post', 2, {
          'title': 'foobar'
        }, {}),
        generateModel('post', 3, {
          'title': 'foobar'
        }, {}),
        generateModel('post', 4, {
          'title': 'foo'
        }, {}),
        generateModel('post', 5, {
          'title': 'bar'
        }, {}),
        generateModel('post', 6, {
          'title': 'foo'
        }, {}),
        generateModel('post', 7, {
          'title': 'foo'
        }, {}),
        generateModel('post', 8, {
          'title': 'foo'
        }, {}),
        generateModel('post', 9, {
          'title': 'foo'
        }, {}),
        generateModel('post', 10, {
          'title': 'foo'
        }, {}),
      ]
    },
    request = {
      queryParams: {
        'filter[search]': 'bar',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(get(result, 'data.length'), 3);

  let items = get(result, 'data');
  assert.equal(items[0].id, 2);
  assert.equal(items[1].id, 3);
  assert.equal(items[2].id, 5);
});

test('it filters by a property on the response', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {}),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {}),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {}),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {}),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {}),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {}),
      ]
    },
    request = {
      queryParams: {
        'filter[color]': 'blue',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(get(result, 'data.length'), 2);

  let items = get(result, 'data');
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 6);
});

test('it searches and filters by a property on the response', function(assert) {
  // JsonApiSerializer.searchByFields = ['title'];
  //
  const serializer = new JsonApiSerializer();

  serializer.searchByFields = ['title'];

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {}),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {}),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {}),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {}),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {}),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {}),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {}),
      ]
    },
    request = {
      queryParams: {
        'filter[color]': 'blue',
        'filter[search]': 'bar',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(get(result, 'data.length'), 1);

  let items = get(result, 'data');
  assert.equal(items[0].id, 3);
});

test('it sorts response by property', function(assert) {
  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('user', 1, {
          age: 12
        }, {}),
        generateModel('user', 2, {
          age: 4
        }, {}),
        generateModel('user', 3, {
          age: 82
        }, {}),
        generateModel('user', 4, {
          age: 2
        }, {}),
      ]
    },
    request = {
      queryParams: {
        'sort': 'age',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(get(result, 'data.length'), 4);

  let items = get(result, 'data');

  assert.equal(items[0].id, 4);
  assert.equal(items[1].id, 2);
  assert.equal(items[2].id, 1);
  assert.equal(items[3].id, 3);

});

test('it sorts response by property decending', function(assert) {
  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('user', 1, {
          age: 12
        }, {}),
        generateModel('user', 2, {
          age: 4
        }, {}),
        generateModel('user', 3, {
          age: 82
        }, {}),
        generateModel('user', 4, {
          age: 2
        }, {}),
      ]
    },
    request = {
      queryParams: {
        'sort': '-age',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(get(result, 'data.length'), 4);

  let items = get(result, 'data');

  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 1);
  assert.equal(items[2].id, 2);
  assert.equal(items[3].id, 4);

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