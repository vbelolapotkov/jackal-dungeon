/**
 * Created by vbelolapotkov on 06/05/15.
 */
DungeonMap = {};

DungeonMap.init = function (tableId, entranceUrl) {
    //add entrance to the map
    Tiles.insert({
        tableId: tableId,
        tileId: 1,
        imgUrl: entranceUrl,
        type: 'entrance',
        location: 'onMap',
        mCoords: {
            x: 0,
            y: 0
        }
    });
};