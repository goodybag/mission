# Mission.js - Permissioning for express apps

Apply Create, Read, Update, and Delete permissions on your APIs based on user groups. Mission will filter incoming fields that API consumers are not supposed to be writing to and will filter outgoing fields that API consumers are not supposed to be reading.

___Example:___

```javascript
var express = require('express');
var mission = require('mission');

var app = express.createServer();

mission.register('users', {
  // Define all fields being access through this resource
  fields: [
    'id', 'screenName', 'avatar', 'password', 'firstName', 'lastName', 'createdAt'
  ]

  // Permissions for non-authenticated users
, world: {
    read:   ['id', 'screenName', 'avatar']

    // No retrictions
  , create: '*'

    // Cannot perform these actions
  , update: false
  , delete: false
  }

  // Permissions for the owner group
, owner: {
    read: '*'
    // Do not allow owner to change "createdAt"
  , update: ['*', '!createdAt']
  }

  // Admins can do everything
  // No need to specify create: '*' because permissions are unioned
, admin: {
    read:   '*'
  , update: '*'
  , delete: true
  }
});

// Call initialize to evaluate all permissions documents and expand references
// to other resources
mission.init();

// Will filter response based on req.user.groups
app.get( '/users'
, mission.filter( 'users' )
, routes.myHandler
);
```

## API

In order of apparent importance.

### ```mission.register( string name, object permissions)```

Registers a new permissions document.

#### Arguments:

* String ```Name``` - The name of the permissions document. Use this to access the permissions document, either directly or from another document.
* Object ```permissions``` - Document outlining permissions for each user group

___Example:___

```javascript
// Access users document

mission.register('users', {
  // Define all fields being access through this resource
  fields: [
    'id', 'screenName', 'avatar', 'password', 'firstName', 'lastName', 'createdAt'
  ]

, world: {
    // Field books references the document name books
    read: ['id', 'screenName', 'books:books']
  , create: ['*']
  , update: false
  }
});

// Directly access the permissions document for users
mission.permissions.users;
```

### ```mission.filter( string name )```

Returns the middleware function to filter out fields for a request.

___Example:___

```javascript
// Will filter request and response body based on req.user.groups
app.post( '/users'
, mission.filter( 'users' )
, routes.myHandler
);
```

### ```mission.init()```

Expands and evaluates all permissions documents. Call after definining all permissions.

### Permissions Document API

The permissions document is the second parameter to the ```register``` function. It outlines what groups to read and write what. There are multiple special characters you can use to control the behavior of mission:

* ```fields``` - This property specifies all fields allowed on the given resource for any group
* ```*``` - Select all fields defined in ```fields```
* ```!{field_name}``` - Exclude a field from the array
* ```{field_name}:{resource_name}.{sub_field_name}``` - Field permissions references another permissions document
  - Note the {sub_field_name} is optional. If you only put ```{field_name}:{resource_name}``` then it will use all of the sub-resource sub-fields
  - Example: ```['id', 'screenName', 'books:books.id', 'books:books.name']```