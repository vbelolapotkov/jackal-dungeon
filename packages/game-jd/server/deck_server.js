/**
 * Created by vbelolapotkov on 06/05/15.
 */
JDDeckController = {};

JDDeckController.init = function (tiles, options) {
    if(!options) return;
    var tableId = options.tableId;
    var backUrl = options.backUrl;
    var imgPath = options.imgPath;

    if(!options.tableId || !tiles || tiles.length < 1) return;

    Tiles.insert({
        tableId: tableId,
        backUrl: backUrl,
        type: 'back',
        location: 'inDeck'
    });

    _.each(tiles, function (tile, index) {
        Tiles.insert({
            tableId: tableId,
            imgUrl: imgPath+tile.imgUrl,
            tileId: tile.id,
            type: tile.type,
            dIndex: index,
            location: 'inDeck'
        });
    });
    JDDeckController.shuffle(tableId);
};

JDDeckController.shuffle = function (tableId) {
    var cursor = Tiles.find({tableId:tableId,location: 'inDeck', type: {$ne: 'back'}});
    var cnt = cursor.count();
    var shuffledIndex = _.shuffle(_.range(cnt));
    cursor.map(function (tile, index) {
        Tiles.update(tile._id, {$set: {dIndex: shuffledIndex[index]}});
    }, shuffledIndex);
};


Meteor.methods({
    'DeckGetFromTop': function (tableId) {
        var topTile = Tiles.findOne({
            tableId: tableId,
            location: 'inDeck'
        },{
            sort: {dIndex: -1},
            limit: 1
        });
        if(!topTile) throw new Meteor.Error(503, 'Internal error: failed to get top tile from deckController');
        Tiles.update(topTile._id, {
            $set: {
                location: 'onTable',
                //coords: { x: 0, y: 0 },
                ownerId: this.userId
            },
            $unset: {
                dIndex: ""
            }
        });
    },
    'DeckShuffle': function (tableId) {
        //todo: add check if action allowed to current user
        JDDeckController.shuffle(tableId);
    }
});