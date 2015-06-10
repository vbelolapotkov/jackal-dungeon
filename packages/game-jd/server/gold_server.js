/**
 * Created by vbelolapotkov on 08/06/15.
 */
GoldController = {};

/*
* Adds coin to pirate and removes in from map tile
* @param - {Object} options
*   tableId - tableId
*   dCoords - dungeon coords of the gold
*   pirate - document of the Pirate to add gold to
* */
GoldController.collectGold = function (options) {
    var tileDoc = Tiles.findOne({
        tableId: options.tableId,
        location: 'onMap',
        hasGold: true,
        'dCoords.x':options.dCoords.x,
        'dCoords.y':options.dCoords.y
    });
    if(!tileDoc)
        throw new Meteor.error(500, 'Failed to find tile with gold');
    var pirate = options.pirate;
    if(pirate.dCoords.x !== tileDoc.dCoords.x || pirate.dCoords.y !== tileDoc.dCoords.y)
        throw new Meteor.Error(403, 'Action forbidden. Pirate has to be on the same tile with coin');
    
    Tiles.update(tileDoc._id, {$set:{hasGold: false}}, function (err, num) {
        if(err || num < 1) {
            throw new Meteor.Error(503, 'Failed to update tile on gold collect');
        } else
            Pirates.update(pirate._id, {$inc:{goldAMT:1}}, function (err) {
                if(err) throw new Meteor.Error(503, 'Failed to update pirate gold amount');
        });
    });
};

Meteor.methods({
    GoldCollectAt: function (dCoords) {
        //todo: check method parameters
        var user = GameTables.parseUserId(this.userId);
        var currentPirate = Pirates.findOne({
            tableId: user.tableId,
            nickname: user.name
        });
        if(!currentPirate) throw new Meteor.Error(401, 'Failed to authorize pirate');
        GoldController.collectGold({
            tableId: user.tableId,
            dCoords: dCoords,
            pirate: currentPirate
        });
    }
});