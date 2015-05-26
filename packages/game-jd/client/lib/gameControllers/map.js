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
    self.mapController.createMap(entranceOpts, function (result) {
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

JDMapController.prototype.dbRemoveTileFromMap = function (doc) {
    //check if already detached
    if(!this.mapController.hasMapTileAt(doc.dCoords)) return;
    this.mapController.detachTile(doc.dCoords);
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

JDMapController.prototype.getRelCoords = function (tile) {
    return this.mapController.getRelCoords(tile);
}

JDMapController.prototype.setMapEventHandlers = function () {
    var self = this;
    var eventMap = [{
        name: 'map:detach',
        handler: this.handleTileDetach.bind(this)
    }];
    this.mapController.addEventHandlers(eventMap);
};
/*
* handle detach tile event fired by cMapController
* @options - dCoords of detached tile
* */
JDMapController.prototype.handleTileDetach = function (options) {
    //1. Check if it is allowed to detach tile from map
    if(this.isTableLocked()) {
        console.log('Cannot detach tile: table is locked');
        return;
    }
    if(options.dCoords.x == 0 && options.dCoords.y == 0) {
        console.log('Cannot detach entrance');
        return;
    }
    //2. Detach tile from map and leave on table
    var tileId = this.mapController.detachTile(options.dCoords, true);
    if(tileId < 0) {
        console.log('Failed to detach tile from canvas');
        return;
    }

    //3. Find tile in DB
    var tileDoc = Tiles.findOne({
        tableId: this.tableId,
        location: 'onMap',
        dCoords: options.dCoords
    });
    if(!tileDoc || tileDoc.tileId!== tileId) {
        console.log('DB tile mismatch on detach from canvas');
        return;
    }
    //4. Update tile data in DB
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


JDMapController.prototype.lock = function () {
    this.tableLocked = true;
}

JDMapController.prototype.unlock = function () {
    this.tableLocked = false;
}

JDMapController.prototype.isTableLocked = function () {
    return this.tableLocked;
};