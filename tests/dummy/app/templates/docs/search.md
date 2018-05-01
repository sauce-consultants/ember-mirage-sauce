# Search

## Basic Searching

The search works the same as a filter but allows you to filter on multiple fields at the same time and it will do a fuzzy search on the values.

    this.store.query('post', {
      filter:{
        search:"foo",
      }
    });

## Defining Search Fields

To provide a realistic api experience between your mocked and real apis you have to define which attributes are searchable in each models mirage serialiser.

    // mirage/serializes/post.js

    import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';
    import {
      A
    } from '@ember/array';

    export default JSONAPISerializer.extend({
      searchByFields:A([
        'title',
        'summary',
        'content'
      ])
    });

## Advanced Search

A common use case for searching is seaching by name. If you have a user model with seperate <code>firstName</code> & <code>lastName</code> attributes, the above example will not work if the users search contains both the first and last name.

### Mirage Model Computed Properties

One solution to this is to create computed properties on the mirage mode. This property is then serisalized by mirage and searchable.

    // mirage/models/user.js
    import {
      Model
    } from 'ember-cli-mirage';
    import {
      computed,
      get
    } from '@ember/object';

    export default Model.extend({
      name: computed('firstName', 'lastName', function() {
        const firstName = get(this, 'firstName'),
          lastName = get(this, 'lastName'),
          name = [];
        if (firstName) {
          name.pushObject(firstName);
        }
        if (lastName) {
          name.pushObject(lastName);
        }
        return name.join(' ');
      }),
    });

Then add the computed "name" property to your user mireage serialize

    // mirage/serializes/user.js

    import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';
    import {
      A
    } from '@ember/array';

    export default JSONAPISerializer.extend({
      searchByFields:A([
        'email',
        'name',
      ])
    });
