/**
 * Created by vbelolapotkov on 12/05/15.
 */
JDTileController = function (tableId, canvas) {
    this.tableId = tableId;
    this.tileController = new cTileController(canvas);
    this.tileController.createContainer({left: 170, top: 60});
};

JDTileController.prototype.addedTileOnTable = function (doc) {
    //todo: add animation for add action
    var self = this;
    this.tileOnTableId = doc.tileId;
    self.tileController.addTile({
        url:doc.imgUrl,
        id: doc.tileId,
        angle: doc.angle
    }, function (tile) {
        //set events on new tile
        var eventMap = [{
            name: 'modified',
            handler: function (options) {
                self.modifiedTileOnTable(this, options);
            }
        }];
        self.tileController.addEventHandlers(tile, eventMap);
        var parent = document.getElementById('jdGameContainer');
        self.tileControlsInstance = Blaze.renderWithData(Template.JDTileControls, tile, parent);
    });
};

JDTileController.prototype.changedTileOnTable = function (newDoc, oldDoc) {
    var self = this;
    var tileId = newDoc.tileId;

    switch (newDoc.lastChange) {
        case 'angle':
            //check if the tile already at the right angle
            self.tileController.rotate(tileId, newDoc.angle);
            break;
        case 'coords':
            //todo: add animation object for coords change
            //self.tileController.move(tileId, newDoc.coords);
            break;
    }
};

JDTileController.prototype.removedTileFromTable = function (oldDoc) {
    var self=this;
    Blaze.remove(self.tileControlsInstance);
    self.tileController.removeTile(self.tileOnTableId);
    self.tileOnTable = undefined;
};

JDTileController.prototype.modifiedTileOnTable = function (tile, options) {
    var self = this;
    if (!options || !options.action) return;
    var actionsMap = {
        'rotate': self.rotateTileOnTable,
        'appendToMap': self.appendTileToMap,
        'returnToDeck': self.returnTileToDeck
    }
    if(actionsMap[options.action]) actionsMap[options.action].call(self,tile);
};

JDTileController.prototype.rotateTileOnTable = function (tile) {
    //todo: update tile angle in db
    var self = this;
    var angle = self.tileController.getAngle(tile);
    var tileId = self.tileController.getId(tile);
    var tileDoc = Tiles.findOne({tableId: self.tableId, location: 'onTable', tileId: tileId});
    //todo: remove console msg when tested
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {angle:angle, lastChange: 'angle'}}, function (err) {
        if (err) console.log(err.reason);
    });
};

JDTileController.prototype.appendTileToMap = function (tile) {
    //todo: change tile location and remove controls
}

JDTileController.prototype.returnTileToDeck = function (tile) {
    //todo: change tile location and remove it from canvas with controls
    var self = this;
    var tileId = self.tileController.getId(tile);
    var tileDoc = Tiles.findOne({tableId: self.tableId, location: 'onTable', tileId: tileId});

    //todo: remove console msg when tested
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {location: 'inDeck'}, $unset: {angle:''}}, function (err) {
        if (err) console.log(err.reason);
    });
};