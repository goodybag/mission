/**
 * Mission.js
 */

var mission = module.exports = {};

// Holds original references to permissions
mission.docs = {};

// Holds expanded references to permissions
mission.expanded = {};

// Holds fields for each document hashed by doc name
mission.fields = {};

mission.options = {
  userField:    'user'
, groupsField:  'groups'
};

mission.init = function(options){
  if (options)
    for (var key in options)
      mission.options[key] = options[key];

  mission._expandReferences();
};

mission.register = function(name, def){
  mission.docs[name] = {};

  for (var key in def){
    if (key == 'fields')
      mission.fields[name] = def.fields;
    else
      mission.docs[name][key] = def[key];
  }
};

mission.filter = function(){

};

mission._expandReferences = function(){
  var doc, fields;

    // Each document definition
  for (var docName in mission.docs){

    doc = mission.docs[docName];
    mission.expanded[docName] = {};

    // Each group in the doc
    for (var group in doc){

      mission.expanded[docName][group] = {}

      // Each set of fields per type of request
      for (var requestType in doc[group]){
        fields = doc[group][requestType];

        // If it's a string, let's assume they just want one field
        if (typeof fields == 'string')
          fields = [ fields ];

        mission.expanded[docName][group][requestType] = mission._getExpandedFields(docName, group, requestType, fields);
      }
    }
  }
};

mission._getExpandedFields = function(name, group, type, fields){
  if (typeof fields === "boolean") return fields;

  // Copy so we don't change the original object
  fields = fields.slice(0);

  var toRemove = ['*'];

  // Go through each permission to see if we have something to expand
  for (var i = 0, doc; i < fields.length; i++){
    if (fields[i][0] == '*'){
      fields = fields.concat( mission.fields[name] );
    }

    else if (fields[i][0] == '!')
      toRemove.push(fields[i], fields[i].substring(1));

    if (fields[i].indexOf(':') === -1) continue;

    // The ol' switcheroo
    doc        = fields[i].substring(fields[i].lastIndexOf(':') + 1);
    fields[i]  = fields[i].substring(0, fields[i].lastIndexOf(':'));

    // add on the expanded set of permissions
    fields = fields.concat(
      mission._getExpandedFields(doc, group, type, mission.docs[doc][group][type]).map(function(perm){
        return fields[i] + "." + perm;
      })
    );
  }

  return fields.filter(function(f){ return toRemove.indexOf(f) == -1; });
};