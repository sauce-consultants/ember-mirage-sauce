import JsonApiSerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';
import {
  module,
  test
} from 'qunit';
import {
  pluralize
} from 'ember-inflector';

module('Unit | Mirage Serialize | json api serializer');

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

  assert.equal(result.data.length, 5);

  let items = result.data;

  assert.equal(items[0].id, 1);
  assert.equal(items[1].id, 2);
  assert.equal(items[2].id, 3);
  assert.equal(items[3].id, 4);
  assert.equal(items[4].id, 5);
});

test('it paginates the response at the second page', function(assert) {

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
        'page[number]': '2',
        'page[size]': '5',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 5);

  let items = result.data;

  assert.equal(items[0].id, 6);
  assert.equal(items[1].id, 7);
  assert.equal(items[2].id, 8);
  assert.equal(items[3].id, 9);
  assert.equal(items[4].id, 10);
});

test('it paginates the response at a page outside of the range', function(assert) {

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
        'page[number]': '23',
        'page[size]': '5',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 0);

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
          'title': 'BARFOO'
        }, {}),
        generateModel('post', 4, {
          'title': 'foo'
        }, {}),
        generateModel('post', 5, {
          'title': 'bar'
        }, {}),
        generateModel('post', 6, {
          'title': 'FOO'
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

  assert.equal(result.data.length, 3);

  let items = result.data;
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
          color: 'green'
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

  assert.equal(result.data.length, 2);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 6);

});

test('it filters by a property with multiple values on the response', function(assert) {
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
          color: 'green'
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
        'filter[color]': 'blue,green',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

  let items = result.data;

  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 6);
  assert.equal(items[2].id, 8);
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

  assert.equal(result.data.length, 1);

  let items = result.data;
  assert.equal(items[0].id, 3);
});

test('it filters by belongsTo relationship', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const author1 = {
      data: {
        id: 1,
        type: 'author'
      }
    },
    author2 = {
      data: {
        id: 2,
        type: 'author'
      }
    },
    author3 = {
      data: {
        id: 3,
        type: 'author'
      }
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          author: author2
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          author: author2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          author: author1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          author: author2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          author: author3
        }),
      ],
      included: [
        generateModel('author', 1, {
          name: 'Frank',
        }),
        generateModel('author', 2, {
          name: 'Frida',
        }),
        generateModel('author', 3, {
          name: 'Fabian',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[authorId]': "2",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 8);
});

test('it filters by belongsTo relationship via .id syntax', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const author1 = {
      data: {
        id: 1,
        type: 'author'
      }
    },
    author2 = {
      data: {
        id: 2,
        type: 'author'
      }
    },
    author3 = {
      data: {
        id: 3,
        type: 'author'
      }
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          author: author2
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          author: author2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          author: author1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          author: author2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          author: author3
        }),
      ],
      included: [
        generateModel('author', 1, {
          name: 'Frank',
        }),
        generateModel('author', 2, {
          name: 'Frida',
        }),
        generateModel('author', 3, {
          name: 'Fabian',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[author.id]': "2",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 8);
});

test('it filters by multiple belongsTo relationships', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const author1 = {
      data: {
        id: 1,
        type: 'author'
      }
    },
    author2 = {
      data: {
        id: 2,
        type: 'author'
      }
    },
    author3 = {
      data: {
        id: 3,
        type: 'author'
      }
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          author: author2
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          author: author2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          author: author1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          author: author2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          author: author3
        }),
      ],
      included: [
        generateModel('author', 1, {
          name: 'Frank',
        }),
        generateModel('author', 2, {
          name: 'Frida',
        }),
        generateModel('author', 3, {
          name: 'Fabian',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[authorId]': "2,3",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 6);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 7);
  assert.equal(items[3].id, 8);
  assert.equal(items[4].id, 9);
  assert.equal(items[5].id, 10);
});

test('it filters by a belongsTo relationship', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const author1 = {
      data: {
        id: 1,
        type: 'author'
      }
    },
    author2 = {
      data: {
        id: 2,
        type: 'author'
      }
    },
    author3 = {
      data: {
        id: 3,
        type: 'author'
      }
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          author: author2
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          author: author2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          author: author1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          author: author2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          author: author3
        }),
      ],
      included: [
        generateModel('author', 1, {
          name: 'Frank',
        }),
        generateModel('author', 2, {
          name: 'Frida',
        }),
        generateModel('author', 3, {
          name: 'Fabian',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[authorId]': "2",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 8);
});

test('it filters by multiple hasMany relationships', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const tag1 = {
      data: [{
        id: 1,
        type: 'tag'
      }]
    },
    tag2 = {
      data: [{
        id: 2,
        type: 'tag'
      }]
    },
    tag3 = {
      data: [{
        id: 3,
        type: 'tag'
      }]
    },
    tag2and3 = {
      data: [{
        id: 3,
        type: 'tag'
      }, {
        id: 2,
        type: 'tag'
      }]
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          tags: tag1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          tags: tag1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          tags: tag1
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          tags: tag2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          tags: tag2
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          tags: tag1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          tags: tag3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          tags: tag2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          tags: tag2and3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          tags: tag3
        }),
      ],
      included: [
        generateModel('tag', 1, {
          name: 'Movies',
        }),
        generateModel('tag', 2, {
          name: 'Music',
        }),
        generateModel('tag', 3, {
          name: 'Food',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[tagIds]': "2,3",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 6);

  let items = result.data;
  assert.equal(items[0].id, 4);
  assert.equal(items[1].id, 5);
  assert.equal(items[2].id, 7);
  assert.equal(items[3].id, 8);
  assert.equal(items[4].id, 9);
  assert.equal(items[5].id, 10);
});

test('it filters by a belongsTo relationship property', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  const author1 = {
      data: {
        id: 1,
        type: 'author'
      }
    },
    author2 = {
      data: {
        id: 2,
        type: 'author'
      }
    },
    author3 = {
      data: {
        id: 3,
        type: 'author'
      }
    };

  let json = {
      data: [
        generateModel('post', 1, {
          title: 'foo',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 2, {
          title: 'foobar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 3, {
          title: 'foobar',
          color: 'blue'
        }, {
          author: author2
        }),
        generateModel('post', 4, {
          title: 'foo',
          color: 'blu'
        }, {
          author: author2
        }),
        generateModel('post', 5, {
          title: 'bar',
          color: 'red'
        }, {
          author: author1
        }),
        generateModel('post', 6, {
          title: 'foo',
          color: 'blue'
        }, {
          author: author1
        }),
        generateModel('post', 7, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 8, {
          title: 'foo',
          color: 'red'
        }, {
          author: author2
        }),
        generateModel('post', 9, {
          title: 'foo',
          color: 'red'
        }, {
          author: author3
        }),
        generateModel('post', 10, {
          title: 'foo',
          color: 'blueblue'
        }, {
          author: author3
        }),
      ],
      included: [
        generateModel('author', 1, {
          name: 'Frank',
          role: 'admin',
        }),
        generateModel('author', 2, {
          name: 'Frida',
          role: 'contributor',
        }),
        generateModel('author', 3, {
          name: 'Fabian',
          role: 'contributor',
        }),
      ]
    },
    request = {
      queryParams: {
        'filter[author.role]': "contributor",
      },
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 6);

  let items = result.data;
  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 7);
  assert.equal(items[3].id, 8);
  assert.equal(items[4].id, 9);
  assert.equal(items[5].id, 10);
});

test('it handles an known filter', function(assert) {
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
      ]
    },
    request = {
      queryParams: {
        'filter[foo]': 'bar',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

});

test('it ignores a filter in the ignoreFilters array', function(assert) {
  //
  const serializer = new JsonApiSerializer();

  serializer.ignoreFilters = ['color'];

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
      ]
    },
    request = {
      queryParams: {
        'filter[color]': 'red',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 3);

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

  assert.equal(result.data.length, 4);

  let items = result.data;

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

  assert.equal(result.data.length, 4);

  let items = result.data;

  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 1);
  assert.equal(items[2].id, 2);
  assert.equal(items[3].id, 4);

});

test('it sorts response by a relationship property', function(assert) {
  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('user', 1, {
          age: 12
        }, {
          car: {
            data: {
              id: 1,
              type: 'car'
            }
          }
        }),
        generateModel('user', 2, {
          age: 4
        }, {
          car: {
            data: {
              id: 2,
              type: 'car'
            }
          }
        }),
        generateModel('user', 3, {
          age: 82
        }, {
          car: {
            data: {
              id: 3,
              type: 'car'
            }
          }
        }),
        generateModel('user', 4, {
          age: 2
        }, {
          car: {
            data: {
              id: 4,
              type: 'car'
            }
          }
        }),
      ],
      included: [
        generateModel('car', 1, {
          year: '1999',
        }),
        generateModel('car', 2, {
          year: '1998',
        }),
        generateModel('car', 3, {
          year: '2012',
        }),
        generateModel('car', 4, {
          year: '2004',
        }),
      ]
    },
    request = {
      queryParams: {
        'sort': 'car.year',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 4);

  let items = result.data;

  assert.equal(items[0].id, 2);
  assert.equal(items[1].id, 1);
  assert.equal(items[2].id, 4);
  assert.equal(items[3].id, 3);

});

test('it sorts response by a relationship property decending', function(assert) {
  const serializer = new JsonApiSerializer();

  let json = {
      data: [
        generateModel('user', 1, {
          age: 12
        }, {
          car: {
            data: {
              id: 1,
              type: 'car'
            }
          }
        }),
        generateModel('user', 2, {
          age: 4
        }, {
          car: {
            data: {
              id: 2,
              type: 'car'
            }
          }
        }),
        generateModel('user', 3, {
          age: 82
        }, {
          car: {
            data: {
              id: 3,
              type: 'car'
            }
          }
        }),
        generateModel('user', 4, {
          age: 2
        }, {
          car: {
            data: {
              id: 4,
              type: 'car'
            }
          }
        }),
      ],
      included: [
        generateModel('car', 1, {
          year: '1999',
        }),
        generateModel('car', 2, {
          year: '1998',
        }),
        generateModel('car', 3, {
          year: '2012',
        }),
        generateModel('car', 4, {
          year: '2004',
        }),
      ]
    },
    request = {
      queryParams: {
        'sort': '-car.year',
      }
    },
    result = serializer._serialize(json, request);

  assert.equal(result.data.length, 4);

  let items = result.data;

  assert.equal(items[0].id, 3);
  assert.equal(items[1].id, 4);
  assert.equal(items[2].id, 1);
  assert.equal(items[3].id, 2);

});

function generateModel(type, id, attributes, relationships) {
  if (relationships) {
    return {
      attributes,
      id,
      relationships,
      type: pluralize(type),
    };
  }
  return {
    attributes,
    id,
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