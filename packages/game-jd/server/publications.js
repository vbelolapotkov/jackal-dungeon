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


