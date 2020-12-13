ember-mirage-sauce
==============================================================================

Mirage Sauce adds some common functionality to mirage based json apis:

-   Filterable
-   Searchable
-   Sortable
-   Paginate


Installation
------------------------------------------------------------------------------

-   `ember install ember-mirage-sauce`

## Usage

Use in your mirage application serializer.

    import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';

    export default JSONAPISerializer.extend({});

## Features

### Debuggin

The serialize function is a bit of a beast and it can be difficult to work out why you are not getting the response you expect sometimes.

To help with this, extensive console logs have been added to the codebase that can be toggled by setting a config value in your application environment file

```
module.exports = function(environment) {
  let ENV = {
    // ...
    'mirage-sauce': {
      debug: true,
    },
    // ...
```

This will give you a pretty noisy (but hopefully useful) output like the following:

```
====================
MIRAGE SAUCE REQUEST
====================
> payload data {data: Array(4)}
> request object {queryParams: {…}}
1.  Filter the response: No filters set
2.  Sort the response -age
2.0 Sort direction: descending
2.1 Sort by attribute "age". Path:
2.2 Sort by path "attributes.age"
3.  Filter hook not set
4.  Pagination not set
```

### Sorting

Passing a `sort` param to your api will automatically sort the returned response.

The following will sort posts by creation date in ascending order

`/api/v1/posts?sort=createdAt`

To switch the order to descending prefix your attribute with a `-`

`/api/v1/posts?sort=-createdAt`

### Filtering

Pass a filter params to filter responses that have a published attribute of true.

`/api/v1/posts?filter[published]=true`

Filter by a belongs to model id by suffixing the relationship name with id

`/api/v1/posts?filter[authorId]=3`

or

`/api/v1/posts?filter[author.id]=3`

Filter by has many relationships ids by suffixing the relationship name with ids

`/api/v1/posts?filter[tagIds]=3,6,7`

You can pass multiple filters

`/api/v1/posts?filter[published]=true&filter[authorId]=3`

**Note** _If filtering by a related model(s) you **must** make sure to include the related model in the response. e.g._

`/api/v1/posts?filter[published]=true&filter[authorId]=3&include=author`

Filter by nested relationships ids or properties

`/api/v1/posts?filter[author.dog.id]=3` or `/api/v1/posts?filter[author.name]=Fred`

### Searching

Pass a filter[search] params to search the responses. By default this will only search attributes named 'email', 'name', 'first-name' & 'last-name'.

`/api/v1/posts?filter[search]=John`

To customise the model fields to search you can override the `searchByFields` property on your models mirage serializer.

```
//.. in mirage/serializers/post
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  searchByFields: A(['title', 'subtitle', 'content']),

});
```

To customize which key in the `filter` query parameter is going to be used, you can override the `searchKey` property on your models mirage serializer.


```
//.. in mirage/serializers/post
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  searchKey: 'fulltext',

});
```

### Pagination

Responses can be paginated by providing a page[size] & page[number] attribute.

`/api/v1/posts?page[size]=50&page[number]=3`

### Customising serializers

#### Ignore Filters

Sometimes you may want to pass complex filters to your real api and not have to implement them in mirage. You can define an array of filters mirage will ignore in your model serializer so data is still returned by your mocked api

    //.. in mirage/serializers/location
    import ApplicationSerializer from './application';

    export default ApplicationSerializer.extend({
      ignoreFilters: [
        'lat',
        'lng'
      ],
    })

#### Filter hook

Define a hook to do your own filtering on a request before it is paginated. This closure function is passed the current json (after filtering and sorting) and the request object. It should return the amended json object that will then be paginated.

    //.. in mirage/serializers/location
    import ApplicationSerializer from './application';
    import {
      A
    } from '@ember/array';

    export default ApplicationSerializer.extend({
      filterHook(json, request){
        //.. do stuff
        return json;
      }
    })

## Requirements

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v10 or above

-   `ember serve`
-   Visit your app at <http://localhost:4200>.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
