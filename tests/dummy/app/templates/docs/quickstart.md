# Quickstart

This quickstart guide will get you going with a docs site for your brand new addon.

1 - **Install the addon.**

    yarn add ember-mirage-sauce

2 - Update your **application serializer** to extend from mirage sauce

    import JSONAPISerializer from 'ember-mirage-sauce/mirage-serializers/json-api-serializer';

    export default JSONAPISerializer.extend({});

3 - **Restart Ember Server**
