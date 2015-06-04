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


Tiles.allow({
    update: function (userId, doc, fieldNames, modifier) {
        //todo: add userId checking
        //todo: think about location change restrictions
        var allowedFields = [
            'coords',
            'dCoords',
            'angle',
            'lastChange',
            'location',
            'ownerId'];
        //check if each field in fieldNames is in allowed list
        return _.every(fieldNames, function (field) {
            return _.contains(allowedFields, field);
        });
    }
});


