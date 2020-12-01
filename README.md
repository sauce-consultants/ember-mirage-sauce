# ember-mirage-sauce

Mirage Sauce adds some common functionality to mirage based json apis:

-   Filterable
-   Searchable
-   Sortable
-   Paginate

## Installation

-   `ember install ember-mirage-sauce`

## Usage

Use in your mirage application serializer.

    import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';

    export default JSONAPISerializer.extend({});

## Features

### Sorting

Passing a `sort` param to your api will automatically sort the returned response.

The following will sort posts by creation date in ascending order

`/api/v1/posts?sort=createdat`

To switch the order to descending prefix your attribute with a `-`

`/api/v1/posts?sort=-createdAt`

### Filtering

Pass a filter params to filter responses that have a published attribute of true.

`/api/v1/posts?filter[published]=true`

Filter by a belongs to model id by suffixing the relationship name with id

`/api/v1/posts?filter[authorId]=3`

Filter by has many relationships ids by suffixing the relationship name with ids

`/api/v1/posts?filter[tagIds]=3,6,7`

You can pass multiple filters

`/api/v1/posts?filter[published]=true&filter[authorId]=3`

**Note** If filtering by a related model(s) you must make sure to include the related model in the response. e.g.

`/api/v1/posts?filter[published]=true&filter[authorId]=3&include=author`

Filter by nested relationships ids or properties

`/api/v1/posts?filter[author.dog.id]=3`

### Searching

Pass a filter[search] params to search the responses. Right now this will only search attributes named 'name', 'first-name' & 'last-name'.

`/api/v1/posts?filter[search]=John`

### Pagination

Responses can be paginated by providing a page[size] & page[number] attribute.

`/api/v1/posts?page[size]=50&page[number]=3`

### Customising serializers

#### Search Fields

Customise the model fields the search filter will check by defining the searchByFields property in that models mirage serializer.

    //.. in mirage/serializers/user
    import ApplicationSerializer from './application';
    import {
      A
    } from '@ember/array';

    export default ApplicationSerializer.extend({
      searchByFields: A([
        'first_name',
        'last_name'
      ]),
    })

#### Ignore Filters

Sometimes you may want to pass complex filters to your real api and not have to implement them in mirage. You can define an array of filters mirage will ignore in your model serializer so data is still returned by your mocked api

    //.. in mirage/serializers/location
    import ApplicationSerializer from './application';
    import {
      A
    } from '@ember/array';

    export default ApplicationSerializer.extend({
      ignoreFilters: A([
        'lat',
        'lng'
      ]),
    })

#### Filter hook

Define a hook to do your own filtering on a request before it is paginated. This closure function is passed the json and request objects and should return the json object

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

## Running

-   `ember serve`
-   Visit your app at <http://localhost:4200>.

## Running Tests

-   `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
-   `ember test`
-   `ember test --server`

## Building

-   `ember build`

For more information on using ember-cli, visit <https://ember-cli.com/>.
