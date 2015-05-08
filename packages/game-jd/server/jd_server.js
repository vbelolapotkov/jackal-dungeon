/**
 * Created by vbelolapotkov on 06/05/15.
 */
JD = {};

JD.initGameCollections = function (tableId) {
    var descriptor = Assets.getText('server/assets/tiles.json');
    var tiles = JSON.parse(descriptor);

    DungeonMap.init(tableId, tiles.entranceUrl);
    var deckOpts = {
        tableId: tableId,
        backUrl: tiles.backUrl,
        imgPath: tiles.imgPath
    };
    Deck.init(tiles.tiles, deckOpts);
};

Meteor.methods({
    logEvent: function (object) {
        console.log(object);
        console.log(object.e.changedTouches);
    }
});