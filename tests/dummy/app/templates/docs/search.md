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
