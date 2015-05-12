//global game object
JD = function (tableId) {
    this._id = tableId || 'demoGame';
    this.dataReady = new ReactiveVar(false);
    var self = this;
    var ms = Meteor.subscribe('dungeonMap', self._id);
    var ds = Meteor.subscribe('tilesDeck', self._id);
    var ts = Meteor.subscribe('tilesOnTable', self._id);
    //subscribe to data if available
    Tracker.autorun(function (c) {
        if(ms.ready() && ds.ready() && ts.ready()) {
            //all data ready
            self.dataReady.set(true);
            console.log(self);
        }
    });
};

JD.prototype.initGame = function (canvasId) {
    console.log('Game init called');
    var self = this;
    self.canvas = new fabric.Canvas(canvasId);
    self.canvas.setWidth(window.innerWidth*0.9);
    self.canvas.setHeight(window.innerHeight*0.9);

    self.deck = new Deck(self._id,self.canvas);
    self.setTableObserver();
};

JD.prototype.setTableObserver = function () {
    var self = this;
    var tilesOnTable = Tiles.find({
        tableId:self._id,
        location: 'onTable'
    });
    Tracker.autorun(function (c) {
        console.log(tilesOnTable);
        console.log(tilesOnTable.fetch());
    });
    self.tableObserver = tilesOnTable.observe({
        added:   self.addedTileOnTable.bind(self),
        changed: self.changedTileOnTable.bind(self),
        removed: self.removedTileFromTable.bind(self)
    });
};

JD.prototype.addedTileOnTable = function (doc) {
    //todo: add animation for add action
    console.log('tile added');
    var self = this;
    //prevent form adding new tile on table
    self.deck.lock();
    var tileOpts = {
        url:doc.imgUrl,
        id: doc.tileId,
        angle: doc.angle || 0,
        left: self.deck.tileContainer.getLeft(),
        top: self.deck.tileContainer.getTop()
    };
    Tile.fromURL(tileOpts, function (tile) {
        self.tileOnTable = tile;
        self.tileOnTable.on('modified', function (options) {
            self.modifiedTileOnTable(tile, options);
        });
        self.canvas.add(self.tileOnTable);
        var parent = document.getElementById('jdGameContainer');
        self.tileControlsInstance = Blaze.renderWithData(Template.JDTileControls, self.tileOnTable, parent);
    })
};

JD.prototype.changedTileOnTable = function (newDoc, oldDoc) {
    var self = this;
    var tileId = newDoc.tileId;
    var tile = Tile.findById(tileId, self.canvas);
    if(!tile) {
        console.log('Changed tile not found on canvas');
        return;
    }
    var animationOpts={};

    switch (newDoc.lastChange) {
        case 'angle':
            //check if the tile already at the right angle
            if(tile.getAngle() !== newDoc.angle)
                animationOpts.angle=newDoc.angle;
            break;
        case 'coords':
            //todo: add animation object for coords change
            break;
    }

    if(_.isEmpty(animationOpts)) return; //nothing to animate
    tile.animate(animationOpts, {
        onChange: self.canvas.renderAll.bind(self.canvas)
    });
};

JD.prototype.removedTileFromTable = function (oldDoc) {
    var self=this;
    console.log('Removed from table:');
    console.log(oldDoc);
    Blaze.remove(self.tileControlsInstance);
    if(self.tileOnTable.id === oldDoc.tileId) {
        self.canvas.remove(self.tileOnTable);
        self.tileOnTable = undefined;
    }
    else {
        //todo: find tile on canvas and remove
        //backdoor if something is going wrong
        console.log('trying to find tile on canvas');
    }
    self.deck.unlock();
};

JD.prototype.modifiedTileOnTable = function (tile, options) {
    var self = this;
    if (!options || !options.action) return;
    var actionsMap = {
        'rotate': self.rotateTileOnTable.bind(self),
        'appendToMap': self.appendTileToMap.bind(self),
        'returnToDeck': self.returnTileToDeck.bind(self)
    }
    if(actionsMap[options.action]) actionsMap[options.action](tile);
};

JD.prototype.rotateTileOnTable = function (tile) {
    //todo: update tile angle in db
    var self = this;
    var angle = tile.getAngle();
    var tileDoc = Tiles.findOne({tableId: self._id, location: 'onTable', tileId: tile.tileId});
    //todo: remove console msg when tested
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {angle:angle, lastChange: 'angle'}}, function (err) {
        if (err) console.log(err.reason);
    });
};

JD.prototype.appendTileToMap = function (tile) {
    //todo: change tile location and remove controls
}

JD.prototype.returnTileToDeck = function (tile) {
    //todo: change tile location and remove it from canvas with controls
    var self = this;
    var tileDoc = Tiles.findOne({tableId: self._id, location: 'onTable', tileId: tile.tileId});

    //todo: remove console msg when tested
    if(!tileDoc || !tileDoc._id) {
        console.log('failed find the tile in db for angle update');
        return;
    }

    Tiles.update(tileDoc._id, {$set: {location: 'inDeck'}, $unset: {angle:''}}, function (err) {
        if (err) console.log(err.reason);
    });
}