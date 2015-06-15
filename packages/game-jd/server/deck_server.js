/**
 * Created by vbelolapotkov on 06/05/15.
 */
DeckController = {};

DeckController.init = function (tiles, options) {
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
            location: 'inDeck',
            hasGold: tile.type === 'goldenHall',
            hasBackdoor: tile.hasBackdoor
        });
    });
    DeckController.shuffle(tableId);
};

DeckController.shuffle = function (tableId) {
    var tileIds = Tiles.find({
            tableId:tableId,
            location: 'inDeck',
            type: {$ne: 'back'}
        }, {
            fields: {_id:1},
            reactive: false
        }).map(function (t) {
            return t._id;
        });
    var cnt = tileIds.length;
    var shuffledIndex = _.shuffle(_.range(cnt));
    tileIds.forEach(function (tileId, index) {
        Tiles.update(tileId, {$set: {dIndex: shuffledIndex[index]}});
    });
};


Meteor.methods({
    'DeckGetFromTop': function (tableId) {
        var errMsg = 'Failed to get new tile from deck. ';
        if(!this.userId) throw new Meteor.Error(403, errMsg + 'Unauthorized access forbidden');

        var user = GameTables.parseUserId(this.userId);
        if(!user || !user.name || user.tableId !== tableId) throw new Meteor.Error(403, errMsg + 'Unauthorized access forbidden');

        var pirate = Pirates.findOne({tableId: user.tableId, nickname: user.name});
        if(!pirate) throw new Meteor.Error(404, errMsg + 'Pirate not found.');

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
                ownerId: pirate._id
            },
            $unset: {
                dIndex: ""
            }
        });
    },
    'JDShuffleDeck': function (tableId) {
        //todo: add check if action allowed to current user
        if(!this.userId) return;
        DeckController.shuffle(tableId);
    }
});