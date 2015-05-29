/**
 * Created by vbelolapotkov on 12/05/15.
 */
TableController = function (options) {
    this.tableId = options.tableId;
    this.mapController = new cMapController(options.canvas);
    this.tileController = new cTileController(options.canvas);
    this.tileController.createContainer({left: 170, top: 60});
    this.setTableObserver();
};

/*
 * @side_effect - sets observer for tiles on table
 * */
TableController.prototype.setTableObserver = function () {
    var tilesOnTable = Tiles.find({
        tableId:this.tableId,
        location: 'onTable'
    });
    this.tableObserver = tilesOnTable.observe({
        added: this.dbAddedTileOnTable.bind(this),
        changed: this.dbChangedTileOnTable.bind(this),
        removed: this.dbRemovedTileFromTable.bind(this)
    });
};

/*
 * @side_effect - creates tile when it is added to table.
 * @doc - db doc of new tile
 * */
TableController.prototype.dbAddedTileOnTable = function (doc) {
    //todo: add animation for add action
    var self = this;

    self.lock();
    self.tileOnTableId = doc.tileId;

    //check if the tile already on canvas
    var tile = self.tileController.findById(doc.tileId);

    if(!tile) {
        var eCoords;
        if(doc.coords) eCoords = self.mapController.getEntranceCoords();
        self.tileController.addNewTile({
            url:doc.imgUrl,
            id: doc.tileId,
            angle: doc.angle,
            coords: doc.coords,
            ref: eCoords
        }, function (tile) {
            tile.showControls();
            self.setTileEventHandlers(tile);
        });
    } else this.setTileEventHandlers(tile);
};

/*
* @side_effect - updates tile on table when it's changed on table in db
* */
TableController.prototype.dbChangedTileOnTable = function (newDoc, oldDoc) {
    var self = this;
    var tileId = newDoc.tileId;

    switch (newDoc.lastChange) {
        case 'angle':
            //check if the tile already at the right angle
            self.tileController.rotate(tileId, newDoc.angle);
            break;
        case 'coords':
            //todo: add animation object for coords change
            var eCoords = self.mapController.getEntranceCoords();
            self.tileController.moveRel(tileId, newDoc.coords,eCoords);
            break;
    }
};

/*
 * @side_effect - remove tile from table when it's removed from table in db
 * */
TableController.prototype.dbRemovedTileFromTable = function (oldDoc) {
    var self=this;
    var t = this.tileController.findById(self.tileOnTableId);
    if(t) t.remove();
    self.tileOnTable = undefined;
    self.unlock();
};

/*
 * @side_effect - registers tile event handlers
 * */
TableController.prototype.setTileEventHandlers = function (tile) {
    tile.on({
        'tile:moved': this.handleMovedTileOnTable.bind(this),
        'tile:rotated': this.handleRotatedTileOnTable.bind(this),
        'tile:attachToMap': this.attachTileToMap.bind(this),
        'tile:returnToDeck': this.returnTileToDeck.bind(this)
    });
};

/*
* @side_effect - updates db when tile moved on table
* @options - event options
* */
TableController.prototype.handleMovedTileOnTable = function (options) {
    var self = this;
    var tile = options.tile;
    var coords = self.mapController.getRelCoords(tile);
    var tileId = tile.getId();
    var tileDoc = Tiles.findOne({tableId: self.tableId, location:'onTable', tileId:tileId});

    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for coords update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {
        coords: coords,
        lastChange: 'coords'
    }}, function (err) {
        if(err) console.log(err.reason);
    });
};

/*
 * @side_effect - updates db when tile rotated on table
 * @options - event options
 * */
TableController.prototype.handleRotatedTileOnTable = function (options) {
    var self = this;
    var tile = options.tile;
    var angle = tile.getAngle();
    var tileId = tile.getId();
    var tileDoc = Tiles.findOne({tableId: self.tableId, location: 'onTable', tileId: tileId});
    //todo: change console msg to log
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {angle:angle, lastChange: 'angle'}}, function (err) {
        if (err) console.log(err.reason);
    });
};

/*
* @side_effect - attaches tile to map and updates db
* @options - event options
* */
TableController.prototype.attachTileToMap = function (options) {
    var self = this;
    var tile = options.tile;
    var dCoords = self.mapController.findEmptyUnderTile(tile);
    if(!dCoords) return;

    //check if it's allowed to attach tile at position
    if(!self.mapController.isAttachAllowed(dCoords)) {
        console.log('TC: Not allowed to attach at this place');
        return;
    }

    var tileDoc = Tiles.findOne({
        tableId: self.tableId,
        location: 'onTable',
        tileId: tile.getId()});
    if(!tileDoc || !tileDoc._id) return;
    tile.remove();
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
        }
    });
};

/*
* @side_effect - removes tile from canvas and updates db
* @options - event options
* */
TableController.prototype.returnTileToDeck = function (options) {
    var self = this;
    var tile = options.tile;
    var tileId = tile.getId();
    var tileDoc = Tiles.findOne({tableId: self.tableId, location: 'onTable', tileId: tileId});

    //todo: remove console msg when tested
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {
        $set: {
            location: 'inDeck',
            lastChange:'returnToDeck'
        },
        $unset: {
            angle:'',
            coords:'',
            ownerId:''
        }
    }, function (err) {
        if (err) console.log(err.reason);
    });
};

/*
* @side_effect - locks table from adding another tile
* */
TableController.prototype.lock = function() {
    //notify deck and map about lock
    this.tableLocked = true;
};

/*
 * @side_effect - unlocks table from adding another tile
 * */
TableController.prototype.unlock = function() {
    //notify deck and map about unlock
    this.tableLocked = false;
};

/*
* @return - boolean. Table locked state
* */
TableController.prototype.isTableLocked = function () {
    return this.tableLocked;
}