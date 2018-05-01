# Pagination

[JSONAPI Pagination](http://jsonapi.org/format/#fetching-pagination)

## Basic Pagination

By default responses are not paginated. To turn on pagination you need to send the page[size] query param.

    this.store.query('user', {
      page:{
        size:25
      }
    });

This will result in the following request URL

    /api/v1/users?page[size]=25

The response data will now include a meta object describing the pagination.

    {
      data: [...],
      meta: {
        page:1,
        pages:5,
        size:25,
        total:117,
      }
    }

## Defining Page Number

To load page two you just pass the page[number] query param.

    this.store.query('user', {
      page:{
        number:2,
        size:25,
      }
    });

This will result in the following request URL

    /api/v1/users?page[number]=2&page[size]=25
