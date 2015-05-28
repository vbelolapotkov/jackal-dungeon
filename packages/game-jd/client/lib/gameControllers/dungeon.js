/**
 * Created by vbelolapotkov on 04/05/15.
 */
//object representing game map
DungeonController = function (options) {
    this.tableId = options.tableId;
    this.canvas = options.canvas;
    this.mapController = new cMapController(options.canvas);
    this.gameController = options.gameController;
    this.mapCreated = false;
};

/*
* @side_effect - loads map with entrance tile
* @callback - callback called when map is loaded. Boolean result passed to callback.
* */
DungeonController.prototype.loadMap = function (callback) {
    var self = this;
    var entranceDoc = Tiles.findOne({
        tableId: self.tableId,
        location: 'onMap',
        type: 'entrance'
    }, {reactive:false});
    var entranceOpts = {
            url:entranceDoc.imgUrl,
            id: entranceDoc.tileId,
            type: entranceDoc.type
        }
    self.mapController.createMap(entranceOpts, function (map) {
        var success = Boolean(map)
        self.mapCreated = success;
        if(success) self.setMapEventHandlers(map);
        self.setMapObserver();
        callback(success);
    });
};

/*
* @side_effect - sets observer for tiles on map
* */
DungeonController.prototype.setMapObserver = function () {
    var tilesOnMap = Tiles.find({
        tableId: this.tableId,
        location: 'onMap'
    });
    this.mapObserver = tilesOnMap.observe({
        added: this.dbAddedTileOnMap.bind(this),
        removed: this.dbRemoveTileFromMap.bind(this)
    });
};

/*
* @side_effect - attaches tile to map when it is added to map
* @doc - db doc of new tile
* */
DungeonController.prototype.dbAddedTileOnMap = function (doc) {
    if(!this.mapCreated) return;
    if(this.mapController.map.hasMapTileAt(doc.dCoords)) {
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

/*
 * @side_effect - detaches tile from map when it is removed from db
 * @doc - db doc of removed tile
 * */
DungeonController.prototype.dbRemoveTileFromMap = function (doc) {
    //check if already detached
    if(!this.mapController.map.hasMapTileAt(doc.dCoords)) return;
    this.mapController.detachTile(doc.dCoords);
};

/*
* @side_effect - registers map event handlers
* */
DungeonController.prototype.setMapEventHandlers = function (map) {
    map.on('map:detach', this.handleTileDetach.bind(this));
};
/*
* handle detach tile event fired by cMapController
* @options - dCoords of detached tile
* */
DungeonController.prototype.handleTileDetach = function (options) {
    //1. Check if it is allowed to detach tile from map
    if(this.gameController.isTableLocked()) {
        console.log('Cannot detach tile: table is locked');
        return;
    }
    if(options.dCoords.x == 0 && options.dCoords.y == 0) {
        console.log('Cannot detach entrance');
        return;
    }
    //2. Detach tile from map and leave on table
    var tile = this.mapController.detachTile(options.dCoords, true);
    if(!tile) {
        console.log('Failed to detach tile from canvas');
        return;
    }

    //3. Attach tile to table
    tile.setFreeStyle();
    this.canvas.add(tile);
    this.canvas.renderAll();
    tile.showControls();

    //4. Find tile in DB
    var tileId = tile.getId();
    var tileDoc = Tiles.findOne({
        tableId: this.tableId,
        location: 'onMap',
        dCoords: options.dCoords
    });
    if(!tileDoc || tileDoc.tileId!== tileId) {
        console.log('DB tile mismatch on detach from canvas');
        return;
    }
    //5. Update tile data in DB
    var relCoords = this.mapController.getRelCoords(tileId);
    Tiles.update(tileDoc._id, {
        $set: {
            location:'onTable',
            lastChange:'detachFromMap',
            coords: relCoords
            //ownerId:
        },
        $unset: {
            dCoords:''
        }
    }, function (err) {
        if(err) console.log(err.reason);
    })
};


DungeonController.prototype.isTableLocked = function () {
    return this.tableLocked;
};