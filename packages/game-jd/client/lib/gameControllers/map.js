/**
 * Created by vbelolapotkov on 04/05/15.
 */
//object representing game map
JDMapController = function (options) {
    var self = this;
    self.tableId = options.tableId;
    self.mapController = new cMapController({
        canvas: options.canvas
    });
    self.mapCreated = false;

    var mapTiles = Tiles.find({
        tableId: self.tableId,
        location: 'onMap'
        //type: 'entrance'
    }, {reactive:false}).fetch();

    var tOptions = [];
    _.each(mapTiles, function (doc) {
        var opts = {
            url:doc.imgUrl,
            id: doc.tileId,
            mCoords: doc.mCoords,
            type: doc.type
        }
        tOptions.push(opts);
    });
    self.mapController.createMap(tOptions, function (result) {
        self.mapCreated = result;
    });
};

JDMapController.prototype.dbAddedTileOnMap = function (doc) {
    if(!this.mapCreated) return;
    if (this.mapController.hasMapTileAt(doc.mCoords)) {
        return;
    }
    //todo: add animation on adding tile to table
    var opts = {
        url: doc.imgUrl,
        id: doc.tileId,
        angle: doc.angle,
        type: doc.type
    };
    this.mapController.attachTile(opts,doc.mCoords);
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

    self.mapController.attachTile(tile, mCoords);
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
        callback(true);
    });
};