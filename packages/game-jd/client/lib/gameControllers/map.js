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
};

JDMapController.prototype.loadMap = function (callback) {
    var self = this;
    var mapTiles = Tiles.find({
        tableId: self.tableId,
        location: 'onMap'
    }, {reactive:false}).fetch();

    var tOptions = [];
    _.each(mapTiles, function (doc) {
        var opts = {
            url:doc.imgUrl,
            id: doc.tileId,
            dCoords: doc.dCoords,
            type: doc.type
        }
        tOptions.push(opts);
    });
    self.mapController.createMap(tOptions, function (result) {
        self.mapCreated = result;

        if(result) self.setMapEventHandlers();
        callback(result);
    });
};

JDMapController.prototype.dbAddedTileOnMap = function (doc) {
    if(!this.mapCreated) return;
    if (this.mapController.hasMapTileAt(doc.dCoords)) {
        return;
    }
    //todo: add animation on adding tile to table
    var opts = {
        url: doc.imgUrl,
        id: doc.tileId,
        angle: doc.angle,
        type: doc.type
    };
    this.mapController.attachTile(opts,doc.dCoords);
};

JDMapController.prototype.attachTile = function (tile, callback) {
    if(!tile || !callback) return;
    var self = this;
    var dCoords = self.mapController.findEmptyUnderTile(tile);
    if(!dCoords) {
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

    self.mapController.attachTile(tile, dCoords);
    Tiles.update(tileDoc._id, {
        $set: {
            location: 'onMap',
            lastChange: 'attachToMap',
            dCoords: dCoords
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

JDMapController.prototype.getEntranceCoords = function () {
    return this.mapController.getEntranceCoords();
};

JDMapController.prototype.setMapEventHandlers = function () {
    var self = this;
    var eventMap = [{
        name: 'map:detach',
        handler: this.handleMapModified.bind(this)
    }];
    this.mapController.addEventHandlers(eventMap);
};

JDMapController.prototype.handleMapModified = function (options) {
    console.log('map: tile detached');
    alert('x:'+options.dCoords.x+' y:'+options.dCoords.y);
}