# Sorting

[JSONAPI Sorting](http://jsonapi.org/format/#fetching-sorting)

## Basic Sorting

To sort your results pass a sort value to your query.

    this.store.query('post', {
      sort:'createdAt'
    });

This will result in the following request URL. Mirage will return posts sorted by createdAt in ascending order.

    /api/v1/posts?sort=createdAt

## Sorting Order

To inverse the order prefix the sort field name with a '-'

  this.store.query('post', {
    sort:'-createdAt'
  });

_NOTE: Currently this addon only supports sorting by one property at a time._
