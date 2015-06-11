GoldController = function (options) {
    this.tableId = options.tableId;
    this.goldController = new cGoldController(options.canvas);
    this.mapController = new cMapController(options.canvas);
    this.mapController.map.on('moving', handleMapMoved.bind(this));
    this.mapController.map.on('object:click',handleMapClicked.bind(this));
    this.setGoldObserver();
};

GoldController.prototype.setGoldObserver = function () {
    var self = this;
    self.goldCursor = Tiles.find({
        tableId: self.tableId,
        location: 'onMap',
        hasGold: true
    });
    self.goldObserver = self.goldCursor.observe({
        added: function (newDoc) {
            self.goldController.putGold(newDoc.dCoords, function (gold) {
                //set event handler on gold double click
                gold.on('object:dblclick', function (options) {
                    var dCoords = this.getDungeonCoords();
                    handleGoldCollect.call(self, dCoords);
                });
            });
        },
        removed: function (oldDoc) {
            self.goldController.removeGold(oldDoc.dCoords);
        }
    });
};

GoldController.prototype.releaseResources = function () {
    this.goldObserver.stop();
};

/*
 * Move gold with map on map move
 * @param - {Object} options of canvas moving event
 * */
function handleMapMoved(options) {
    this.goldController.canvas.discardActiveObject();
    var gold = this.goldController.findAllGold();
    if(!gold || gold.length < 1) return;
    var eCoords = this.mapController.getEntranceCoords();
    _.each(gold, function (g) {
        var relPos = g.getRelPosition();
        g.setPosition({
            left: relPos.left + eCoords.left,
            top: relPos.top + eCoords.top
        });
    });
};

/*
 * Handle clicks on map for pirates moves
 * @param - {Object} options of canvas event
 * */
function handleMapClicked(options) {
    var gold = this.goldController.getSelected();
    if(!gold) {
        //not trying to move gold
        return;
    };
    var cCoords = {
        left: options.e.offsetX,
        top: options.e.offsetY
    };

    var goldDCoords = gold.getDungeonCoords();
    var nextDCoords = this.mapController.findDungeonCoords(cCoords);
    if(!this.mapController.map.hasMapTileAt(nextDCoords)){
        return;
    };

    var currentTileDoc = Tiles.findOne({
        location: 'onMap',
        'dCoords.x':goldDCoords.x,
        'dCoords.y':goldDCoords.y,
        hasGold: true
    });

    var nextTileDoc = Tiles.findOne({
        location: 'onMap',
        'dCoords.x':nextDCoords.x,
        'dCoords.y':nextDCoords.y,
        hasGold: false
    });

    if(!currentTileDoc || !nextTileDoc) {
        console.error('JD Gold: failed error moving gold');
        console.trace();
        return;
    }

    Tiles.update(currentTileDoc._id, {$set: { hasGold: false}}, function (err) {
        if(err) {
            console.error('JD Gold Error: failed to remove gold from tile');
            console.error(err.reason);
            console.trace();
        }
        else Tiles.update(nextTileDoc._id, {$set: {hasGold: true}}, function (err) {
            if(err) {
                console.error('JD Gold Error: failed to add gold on tile move');
                console.error(err.reason);
                console.trace();
            }
        })
    });
    this.goldController.canvas.discardActiveObject();
}

/*
* Collect gold if appropriate
* @param - {Object} dCoords of the gold Coin
* */
function handleGoldCollect(dCoords) {
    if(!this.goldController) return;
    var gold = this.goldController.findGoldAt(dCoords);
    if(!gold) {
        console.error('JD Gold Error: Gold not found at (%s;%s)',dCoords.x, dCoords.y);
        return;
    }
    var pC = new cPiratesController(this.goldController.canvas);
    var pirates = pC.findPiratesAt(dCoords);
    if(!pirates) {
        console.error('JD Gold Error: Trying to collect gold from tile without pirates');
        return;
    }
    Meteor.call('GoldCollectAt', dCoords, function (err) {
        if(err) {
            console.error('JD Gold Error: '+err.reason);
        }
    });
}