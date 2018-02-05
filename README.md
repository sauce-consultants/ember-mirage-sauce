# ember-mirage-sauce

Mirage Sauce adds some common functionality to mirage based json apis:

- Filterable
- Searchable
- Sortable
- Paginate

## Installation

- `ember install ember-mirage-sauce`

## Usage

Use in your mirage application serializer.

```
import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';

export default JSONAPISerializer.extend({});
```

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

You can pass multiple filters and also filter by a related models id.

`/api/v1/posts?filter[published]=true&filter[authorId]=3`

**Note** If filtering by a related model you must make sure to include the related model in the response. e.g.

`/api/v1/posts?filter[published]=true&filter[authorId]=3&include=author`

### Searching

Pass a filter[search] params to search the responses. Right now this will only search attributes named 'name', 'first-name' & 'last-name'.

`/api/v1/posts?filter[search]=John`

### Pagination

Responses can be paginated by providing a page[size] & page[number] attribute.

`/api/v1/posts?page[size]=50&page[number]=3`

## Running

- `ember serve`
- Visit your app at <http://localhost:4200>.

## Running Tests

- `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
- `ember test`
- `ember test --server`

## Building

- `ember build`

For more information on using ember-cli, visit <https://ember-cli.com/>.
