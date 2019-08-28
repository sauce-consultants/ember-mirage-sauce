import findNestedRelationship from 'dummy/utils/find-nested-relationship';
import {
  module,
  test
} from 'qunit';
import {
  pluralize
} from 'ember-inflector';
import {
  get
} from '@ember/object';

module('Unit | Utility | find nested relationship');

// Finds a relationship one level deep
test('it finds a relationship one level deep', function(assert) {
  const record = generateModel('transaction', 1, {}, {
      card: generateRelationship('card', 1)
    }),
    relationships = seedDummyRelationshipData(),
    path = 'card.account.id';

  let result = findNestedRelationship(record, relationships, path);

  assert.equal(get(result, 'type'), 'accounts');
  assert.equal(get(result, 'id'), 1);
});

test('it does not find a relationship one level deep', function(assert) {
  const record = generateModel('transaction', 1, {}, {
      card: generateRelationship('card', 1)
    }),
    relationships = seedDummyRelationshipData(),
    path = 'card.user.id';

  let result = findNestedRelationship(record, relationships, path);

  assert.equal(result, null);
});

// Finds a relationship two levels deep
test('it finds a relationship two levels deep', function(assert) {
  const record = generateModel('transaction', 1, {}, {
      card: generateRelationship('card', 1)
    }),
    relationships = seedDummyRelationshipData(),
    path = 'card.account.user.id';

  let result = findNestedRelationship(record, relationships, path);

  assert.equal(get(result, 'type'), 'users');
  assert.equal(get(result, 'id'), 1);
});


// Finds a relationship three levels deep
test('it finds a relationship three levels deep', function(assert) {
  const record = generateModel('transaction', 1, {}, {
      card: generateRelationship('card', 1)
    }),
    relationships = seedDummyRelationshipData(),
    path = 'card.account.user.dog.id';

  let result = findNestedRelationship(record, relationships, path);

  assert.equal(get(result, 'type'), 'dogs');
  assert.equal(get(result, 'id'), 1);
});

// function seedDummyRecordData() {
//   return [
//     generateModel('transaction', 1, {}, {
//       card: generateRelationship('card', 1)
//     }),
//     generateModel('transaction', 2, {}, {
//       card: generateRelationship('card', 2)
//     }),
//     generateModel('transaction', 3, {}, {
//       card: generateRelationship('card', 3)
//     }),
//     generateModel('transaction', 4, {}, {
//       card: generateRelationship('card', 2)
//     }),
//     generateModel('transaction', 5, {}, {
//       card: generateRelationship('card', 3)
//     }),
//   ];
// }

function seedDummyRelationshipData() {
  return [
    generateModel('card', 1, {}, {
      account: generateRelationship('account', 1)
    }),
    generateModel('card', 2, {}, {
      account: generateRelationship('account', 1)
    }),
    generateModel('card', 3, {}, {
      account: generateRelationship('account', 3)
    }),
    generateModel('account', 1, {}, {
      user: generateRelationship('user', 1)
    }),
    generateModel('account', 2, {}, {
      user: generateRelationship('user', 2)
    }),
    generateModel('user', 1, {}, {
      dog: generateRelationship('dog', 1)
    }),
    generateModel('user', 2, {}, {
      dog: generateRelationship('dog', 2)
    }),
    generateModel('dog', 1, {}, {}),
    generateModel('dog', 2, {}, {}),
  ];
}

function generateModel(type, id, attributes, relationships) {
  return {
    attributes,
    id,
    relationships,
    type: pluralize(type),
  };
}

function generateRelationship(type, id) {
  return {
    data: {
      id,
      type: pluralize(type)
    }
  };
}