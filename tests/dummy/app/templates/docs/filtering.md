# Filtering

[JSONAPI Filtering](http://jsonapi.org/format/#fetching-filtering)

Pass any filter attribute as a query param to filter slicedResults

## Example

From your route make the following request:

    this.store.query('user', {
      filter:{
        firstName:"Sue",
      }
    });

This will result in the following api request and mirage only returning users with a first name of "Sue"

    /api/v1/users?filter[firstName]=Sue

## Related Filters

You can filter records based on their relationships.

_NOTE:_ When filtering on related models you must include the relationship in your query so the data is available in the serializers to filter.

    this.store.query('user', {
      filter:{
        businessId:42,
      },
      include:'business',
    });

Assuming relationships are set up and user _belongsTo_ business, mirage will now only return users belonging to the business with id 42.

    /api/v1/users?filter[businessId]=42&include=business

## Multiple Filters

Multiple filter params can be sent at the same time

    this.store.query('user', {
      filter:{
        businessId:42,
        firstName:"Sue",
      },
      include:'business',
    });

Resulting in the following request URL

    /api/v1/users?filter[businessId]=42&filter[firstName]=Sue&include=business
