var assert = require('assert');
var mission = require('../');

describe('mission.register', function(){
  it('should register a document with world permissions', function(){
    var usersDoc = {
      world: {
        read: ['id', 'screenName']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);

    assert.equal( !!mission.docs.users, true );

    assert.equal(
      JSON.stringify(mission.docs.users, true, '  ')
    , JSON.stringify(usersDoc, true, '  ')
    );
  });

  it('should register a document and set fields', function(){
    var usersDoc = {
      fields: ['id', 'screenName', 'firstName', 'lastName']
    , world: {
        read: ['id', 'screenName']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);

    assert.equal( !mission.docs.users.fields, true );

    assert.equal(
      JSON.stringify(mission.fields.users, true, '  ')
    , JSON.stringify(usersDoc.fields, true, '  ')
    );
  });
});

describe('mission.init', function(){
  it('should set options', function(){
    var options = { userField: 'blah', groupsField: 'bob' };
    mission.init( options );
    assert.equal( options.userField, mission.options.userField );
    assert.equal( options.groupsField, mission.options.groupsField );
  });

  it('should expand references even for simple cases without expansions', function(){
    var usersDoc = {
      world: {
        read: ['id', 'screenName']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);

    mission.init();

    assert.equal(
      JSON.stringify(mission.expanded.users, true, '  ')
    , JSON.stringify(usersDoc, true, '  ')
    );
  });

  it('should expand references with expansions', function(){
    var usersDoc = {
      world: {
        read: ['id', 'screenName', 'books:books']
      , create: false
      , delete: false
      , update: false
      }
    };

    var booksDoc = {
      world: {
        read: ['id', 'name']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);
    mission.register('books', booksDoc);

    mission.init();

    var a = mission.expanded.users.world.read;
    var b = ['id', 'screenName', 'books'].concat(
      booksDoc.world.read.map(function(b){ return 'books.' + b; })
    );

    assert.equal(
      JSON.stringify(a, true, '  ')
    , JSON.stringify(b, true, '  ')
    );
  });

  it('should include all fields', function(){
    var usersDoc = {
      fields: ['id', 'screenName', 'firstName', 'lastName']
    , world: {
        read: '*'
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);
    mission.init();

    assert.equal(
      JSON.stringify(mission.expanded.users.world.read, true, '  ')
    , JSON.stringify(usersDoc.fields, true, '  ')
    );
  });

  it('should include all fields except lastName', function(){
    var usersDoc = {
      fields: ['id', 'screenName', 'firstName', 'lastName']
    , world: {
        read: ['*', '!lastName']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);
    mission.init();

    var a = mission.expanded.users.world.read;
    var b = usersDoc.fields.filter(function(f){
      return f != 'lastName';
    });

    assert.equal(
      JSON.stringify(a, true, '  ')
    , JSON.stringify(b, true, '  ')
    );
  });

  it('should include all fields except firstName and lastName', function(){
    var usersDoc = {
      fields: ['id', 'screenName', 'firstName', 'lastName']
    , world: {
        read: ['*', '!firstName', '!lastName']
      , create: false
      , delete: false
      , update: false
      }
    };

    mission.register('users', usersDoc);
    mission.init();

    var a = mission.expanded.users.world.read;
    var b = usersDoc.fields.filter(function(f){
      return ['firstName', 'lastName'].indexOf(f) == -1;
    });

    assert.equal(
      JSON.stringify(a, true, '  ')
    , JSON.stringify(b, true, '  ')
    );
  });
});