# graffiti-mongoose

[![Build Status](https://travis-ci.org/RisingStack/graffiti-mongoose.svg)](https://travis-ci.org/RisingStack/graffiti-mongoose)

[Mongoose](http://mongoosejs.com) (MongoDB) adapter for the [graffiti](https://github.com/RisingStack/graffiti) [GraphQL](https://github.com/graphql/graphql-js) ORM.  

`graffiti-mongoose` generates `GraphQL` types and schemas from your existing `mongoose` models, that's how simple it is. The generated schema is compatible with [Relay](https://facebook.github.io/relay/).

For quick jump check out the [Usage section](https://github.com/RisingStack/graffiti-mongoose#graffiti-mongoose-1).

## Install

```shell
npm install graphql @risingstack/graffiti-mongoose --save
```

## Example

Check out the [/example](https://github.com/RisingStack/graffiti-mongoose/tree/master/example) folder.

```shell
cd graffiti-mongoose
npm install # install dependencies in the main folder
cd example
npm install # install dependencies in the example folder
node . # run the example application and open your browser: http://localhost:8080
```

## Usage

This adapter is written in `ES6` and `ES7` with [Babel](https://babeljs.io) but it's published as transpiled `ES5` JavaScript code to `npm`, which means you don't need `ES7` support in your application to run it.  

##### usual mongoose model(s)
```javascript
import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number,
    indexed: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

var User = mongoose.model('User', UserSchema);
```

##### graffiti-mongoose
```javascript
import {getSchema} from '@risingstack/graffiti-mongoose';
import graphql from 'graphql';

var schema = getSchema([User]);

var query = `{
    users(age: 28) {
      name
      friends(first: 2) {
        egdes {
          cursor
          node {
            name
            age
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }
  }`;

graphql(schema, query)
  .then((result) => {
    console.log(result);
  });
```

## Supported mongoose types

* Number
* String
* Boolean
* Date
* [Number]
* [String]
* [Boolean]
* [Date]
* ObjectId with ref (reference to other document, populate)
* more types coming soon...

## Supported query types

* query
  * singular: for example `user`
  * plural: for example `users`
  * [node](https://facebook.github.io/relay/docs/graphql-object-identification.html): takes a single argument, a unique `!ID`, and returns a `Node`

## Supported query arguments

* indexed fields
* "id" on singular type
* array of "id"s on plural type

Which means, you are able to filter like below, if the age is indexed in your mongoose model:

```
users(age: 19) {}
user(id: "mongoId1") {}
user(id: "relayId") {}
users(id: ["mongoId", "mongoId2"]) {}
users(id: ["relayId1", "relayId2"]) {}
```

## Test

```shell
npm test
```

## License

[MIT](https://github.com/RisingStack/graffiti-mongoose/tree/master/LICENSE)
