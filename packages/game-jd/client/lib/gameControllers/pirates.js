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
    Meteor.call('PirateCheckMeIn');
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
        changed: function (newDoc, oldDoc) {

        },
        removed: function (oldDoc) {

        }
    });
};

/*
* Handle clicks on map for pirates moves
* @param - {Object} options of canvas event
* */
function handleMapClicked(options) {
    var pirate = this.piratesController.getSelected();
    if(!pirate) {
        return;
    };
    var cCoords = {
        left: options.e.offsetX,
        top: options.e.offsetY
    };
    //check if player clicked on map tile
    var nextDCoords = this.mapController.findDungeonCoords(cCoords);
    if(!this.mapController.map.hasMapTileAt(nextDCoords)){
        return;
    }
    var pirateDCoords = pirate.getDungeonCoords();

    //animate movement
    if(isDungeonNeighbors(pirateDCoords, nextDCoords)){
        this.piratesController.step(pirate,cCoords);
    }
    else {
        this.piratesController.reappear(pirate, cCoords);
    }
    var eCoords = this.mapController.getEntranceCoords();
    pirate.setRelPosition(cCoords,eCoords);
    pirate.setDungeonCoords(nextDCoords);
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
}