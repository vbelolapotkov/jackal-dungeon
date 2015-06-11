/**
 * Created by vbelolapotkov on 06/05/15.
 */
Meteor.publish('dungeonMap', function (tableId) {
    var cursor = Tiles.find({tableId: tableId, location: 'onMap'});
    if(cursor.count()<1) {
        JD.initGameCollections(tableId);
    }
    return cursor;
});

Meteor.publish('tilesOnTable', function (tableId) {
   return Tiles.find({tableId: tableId, location: 'onTable'});
});

Meteor.publish('tilesDeck', function (tableId) {
    return Tiles.find({tableId: tableId, location: 'inDeck'},{fields:{imgUrl: 0}});
});

Meteor.publish('dungeonPirates', function (tableId) {
    return Pirates.find({tableId: tableId});
});

Meteor.publish('tableDice', function (tableId) {
    return Dice.find({tableId: tableId});
});

Pirates.allow({
    update: function (userId, doc, fieldName, modifier) {
        var user = GameTables.parseUserId(userId);
        if(!user || !user.tableId || !user.tableId===doc.tableId) return false;
        return true;
    }
});

Dice.allow({
    insert: function () {return false;},
    update: function () {return false;},
    remove: function (userId, doc) {
        var user = GameTables.parseUserId(userId);
        return user && user.tableId === doc.tableId;
    }
});

Tiles.allow({
    update: function (userId, doc, fieldNames) {
        var user = GameTables.parseUserId(userId);
        if(!user || !user.tableId || !user.tableId===doc.tableId) return false;
        //todo: think about location change restrictions
        var allowedFields = [
            'coords',
            'dCoords',
            'angle',
            'lastChange',
            'location',
            'ownerId',
            'hasGold'
        ];
        //check if each field in fieldNames is in allowed list
        return _.every(fieldNames, function (field) {
            return _.contains(allowedFields, field);
        });
    }
});


