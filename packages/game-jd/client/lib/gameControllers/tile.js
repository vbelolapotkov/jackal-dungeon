/**
 * Created by vbelolapotkov on 12/05/15.
 */
JDTileController = function (options) {
    this.tableId = options.tableId;
    this.deckController = options.deckController;
    this.mapController = options.mapController;
    this.tileController = new cTileController(options.canvas);
    this.tileController.createContainer({left: 170, top: 60});
};

JDTileController.prototype.dbAddedTileOnTable = function (doc) {
    //todo: add animation for add action
    var self = this;
    self.deckController.lock();
    self.tileOnTableId = doc.tileId;
    var eCoords;
    if(doc.coords) eCoords = self.mapController.getEntranceCoords();
    self.tileController.addNewTile({
        url:doc.imgUrl,
        id: doc.tileId,
        angle: doc.angle,
        coords: doc.coords,
        ref: eCoords
    }, function (tile) {
        //set events on new tile
        var eventMap = [{
            name: 'modified',
            handler: function (options) {
                self.handleModifiedTileOnTable(this, options);
            }
        }];
        self.tileController.addEventHandlers(tile, eventMap);
        var parent = document.getElementById('jdGameContainer');
        self.tileControlsInstance = Blaze.renderWithData(Template.JDTileControls, tile, parent);
    });
};

JDTileController.prototype.dbChangedTileOnTable = function (newDoc, oldDoc) {
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

JDTileController.prototype.dbRemovedTileFromTable = function (oldDoc) {
    var self=this;
    Blaze.remove(self.tileControlsInstance);
    self.tileController.removeTile(self.tileOnTableId);
    self.tileOnTable = undefined;
    self.deckController.unlock();
};

JDTileController.prototype.handleModifiedTileOnTable = function (tile, options) {
    var self = this;
    if (!options || !options.action) return;
    var actionsMap = {
        'move': self.handleMovedTileOnTable,
        'rotate': self.handleRotatedTileOnTable,
        'appendToMap': self.attachTileToMap,
        'returnToDeck': self.returnTileToDeck
    };
    if(actionsMap[options.action]) actionsMap[options.action].call(self,tile);
};

JDTileController.prototype.handleMovedTileOnTable = function (tile) {
    var self = this;
    var eCoords = self.mapController.getEntranceCoords();
    var coords = self.tileController.getRelCoords(tile, eCoords);
    var tileId = self.tileController.getId(tile);
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

JDTileController.prototype.handleRotatedTileOnTable = function (tile) {
    var self = this;
    var angle = self.tileController.getAngle(tile);
    var tileId = self.tileController.getId(tile);
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

JDTileController.prototype.attachTileToMap = function (tile) {
    //todo: change tile location and remove controls
    var self = this;
    self.mapController.attachTile(tile, function (success) {
        if(!success) return;
        self.deckController.unlock();
        Blaze.remove(self.tileControlsInstance);
    });
};

JDTileController.prototype.returnTileToDeck = function (tile) {
    var self = this;
    var tileId = self.tileController.getId(tile);
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
        else self.deckController.shuffle();
    });
};