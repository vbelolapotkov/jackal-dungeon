/**
 * Created by vbelolapotkov on 26/05/15.
 */
PiratesController = function (options) {
    this.tableId = options.tableId;
    this.piratesController = new cPiratesController(options.canvas);
    this.mapController = new cMapController(options.canvas);
    this.mapController.map.on('object:click',handleMapClicked.bind(this));
    this.mapController.map.on('moving',handleMapMoved.bind(this));
    this.setPiratesObserver();
};

PiratesController.prototype.setPiratesObserver = function () {
    var self = this;
    self.piratesCursor = Pirates.find({tableId: self.tableId});
    self.piratesCursor.observe({
        added: function (doc) {
            self.piratesController.addNewPirate({
                color: doc.color,
                id: doc._id,
                dCoords: doc.dCoords,
                mCoords: doc.mCoords
            });
        },
        removed: function (oldDoc) {
            //todo: handle Pirate removed
        }
    });
    var changeHandlersMap = {
        dCoords: handleDCoordsChange,
        mCoords: handleMCoordsChange,
        color: handleColorChange
    };
    self.piratesCursor.observeChanges({
        changed: function (id, fields) {
            var pirate = self.piratesController.findPirates(function (p) {
                return p.id === id;
            })[0];
            if(!pirate){
                console.error('JD Pirates Error: pirate not found');
                console.trace();
                return;
            };
            //call handler for each changed field
            _.each(fields, function (value, field) {
                changeHandlersMap[field] && changeHandlersMap[field].call(self,pirate,value);
            });
        }
    });
};

function handleDCoordsChange(pirate, dCoords){
    var pCoords = pirate.getDungeonCoords();
    if(pCoords.x === dCoords.x && pCoords.y === dCoords.y) return;
    pirate.setDungeonCoords(dCoords);
};

function handleMCoordsChange(pirate, mCorods) {
    if(!this.mapController) return;
    var eCoords = this.mapController.getEntranceCoords();
    var cCoords = JDGameController.rel2abs(mCorods, eCoords);
    var pCoords = pirate.getPosition();
    if(pCoords.left === cCoords.left && pCoords.top === cCoords.top) return;
    pirate.setRelPosition(mCorods);
    animatePirateMove.call(this,pirate,cCoords);
};

function handleColorChange(pirate, color) {
    pirate.setColor(color);
    pirate.canvas.renderAll();
};

/*
* Animate pirate move to canvas coords
* @return - {Object} x:Number y:Number new dungeon coords
* @param - {cPirate} pirate object
* @param - {Object} left:Number, top:Number new canvas coords
* */
function animatePirateMove(pirate, cCoords) {
    var nextDCoords = this.mapController.findDungeonCoords(cCoords);
    if(!this.mapController.map.hasMapTileAt(nextDCoords)){
        //not a tile
        return;
    };

    var pirateDCoords = this.mapController.findDungeonCoords(pirate.getPosition());
    if(isDungeonNeighbors(pirateDCoords, nextDCoords)){
        this.piratesController.step(pirate,cCoords);
    } else {
        this.piratesController.reappear(pirate, cCoords);
    }
    return nextDCoords;
}

/*
* Handle clicks on map for pirates moves
* @param - {Object} options of canvas event
* */
function handleMapClicked(options) {
    var pirate = this.piratesController.getSelected();
    if(!pirate) {
        //not trying to move pirate
        return;
    };
    var cCoords = {
        left: options.e.offsetX,
        top: options.e.offsetY
    };

    var pirateDoc = Pirates.findOne(pirate.id);
    if(!pirateDoc) {
        console.error('JD Pirate Error: failed to find pirate in DB');
        console.trace();
        return;
    }

    //try to animate pirate move
    var nextDCoords = animatePirateMove.call(this, pirate, cCoords);
    if(!nextDCoords) return;

    var eCoords = this.mapController.getEntranceCoords();
    var relCoords = JDGameController.abs2rel(cCoords,eCoords);
    pirate.setRelPosition(relCoords);
    pirate.setDungeonCoords(nextDCoords);

    Pirates.update(pirateDoc._id, {
        $set: {
            dCoords: nextDCoords,
            mCoords: relCoords
        }
    }, function (err) {
        if(err) {
            console.error('JD Pirates Error: failed to update pirate coords in DB');
            console.error(err.reason);
            console.trace();
        }
    });

    this.piratesController.setSelected(pirate);
}

/*
* Check if two points in dungeon coords are neigbors
* @return {Boolean}
* @param - {Object} p1,p2 point dCoords
* */
function isDungeonNeighbors(p1, p2) {
    var dist = Math.abs(p1.x-p2.x)+Math.abs(p1.y-p2.y);
    //neighbors will have distance equal to 1
    return dist<2;
};

/*
* Move pirates with map on map move
* @param - {Object} options of canvas moving event
* */
function handleMapMoved(options) {
    this.piratesController.canvas.discardActiveObject();
    var pirates = this.piratesController.findPirates();
    if(!pirates || pirates.length < 1) return;
    var eCoords = this.mapController.getEntranceCoords();
    _.each(pirates, function (p) {
        var relPos = p.getRelPosition();
        p.setPosition({
            left: relPos.left + eCoords.left,
            top: relPos.top + eCoords.top
        });
    });
};