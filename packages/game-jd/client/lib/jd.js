//global game object
JD = function (tableId) {
    this._id = tableId || 'demoGame';
    this.dataReady = new ReactiveVar(false);
    var self = this;
    var ms = Meteor.subscribe('dungeonMap', self._id, function () {
        console.log('JD: Map subscription is ready');
    });
    var ds = Meteor.subscribe('tilesDeck', self._id, function () {
        console.log('JD: Deck subscription is ready');
    });
    var ts = Meteor.subscribe('tilesOnTable', self._id, function () {
        console.log('JD: Table subscription is ready');
    });
    //subscribe to data if available
    Tracker.autorun(function () {
        if(ms.ready() && ds.ready() && ts.ready()) {
            //all data ready
            self.dataReady.set(true);
        }
    });
};

JD.prototype.initGame = function (canvasId) {
    console.log('JD: Initializing Game ...');
    var self = this;
    self.canvas = new CanvasExt(canvasId);
    self.canvas.setWidth(window.innerWidth*0.9);
    self.canvas.setHeight(window.innerHeight*0.9);

    self.deckController = new JDDeckController(self._id,self.canvas);
    self.deckController.loadDeck();
    self.mapController = new JDMapController({
        tableId: self._id,
        canvas: self.canvas
    });

    //load map first and than load other resources
    self.mapController.loadMap(function (result) {
        if(!result) {
            console.log('Failed to load map');
            return;
        }
        self.tileController = new JDTileController({
            tableId: self._id,
            canvas: self.canvas,
            deckController: self.deckController,
            mapController: self.mapController
        });
        self.gameSync = new JDSynchronizer({
            tableId: self._id,
            deckController: self.deckController,
            tileController: self.tileController,
            mapController: self.mapController
        });
        console.log('JD: Game Initialized');
    })
};