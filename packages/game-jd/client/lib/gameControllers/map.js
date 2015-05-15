/**
 * Created by vbelolapotkov on 04/05/15.
 */
//object representing game map
JDMapController = function (options) {
    this.tableId = options.tableId;
    this.mapController = new cMapController({
        canvas: options.canvas
    });
};

JDMapController.prototype.addedTileOnMap = function (doc) {
    if(doc.type === 'entrance') this.mapController.createMap({
        url:doc.imgUrl,
        id: doc.tileId
        //angle: doc.angle,
        //coords: doc.coords
    });
    else {
        console.log(this.mapController);
        //todo: handle adding tile on map by sync
        //this.mapController.attachTile(doc,doc.mCoords);
    }
};

JDMapController.prototype.attachTile = function (tile, callback) {
    if(!tile || !callback) return;
    var self = this;
    var mCoords = self.mapController.findMapCoords(tile);
    if(!mCoords) {
        callback(false);
        return;
    }

    var tileDoc = Tiles.findOne({
        tableId: self.tableId,
        location: 'onTable',
        tileId: self.mapController.getTileId(tile)});
    if(!tileDoc || !tileDoc._id) {
        callback(false)
        return;
    }

    Tiles.update(tileDoc._id, {
        $set: {
            location: 'onMap',
            lastChange: 'attachToMap',
            mCoords: mCoords
        },
        $unset: {
            ownerId: '',
            coords: ''
        }
    }, function (err) {
        if(err) {
            console.log(err.reason);
            callback(false);
            return;
        }
        self.mapController.attachTile(tile, mCoords);
        self.mapController.addEmptyTiles(self.getEmptyNeighbors(mCoords));
        callback(true);
    });
};

JDMapController.prototype.getEmptyNeighbors = function (mCoords) {
    var candidates = [
        {x: mCoords.x + 1, y: mCoords.y},
        {x: mCoords.x - 1, y: mCoords.y},
        {x: mCoords.x    , y: mCoords.y + 1},
        {x: mCoords.x    , y: mCoords.y - 1},
    ];
    var result = [];
    var self = this;
    _.each(candidates, function (c) {
        if(!self.mapController.hasTileAt(c))
            result.push(c);
    });
    return result;
};