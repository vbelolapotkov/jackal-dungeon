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
    var canvas = new CanvasExt(canvasId, {
        width: window.innerWidth*0.9,
        height: window.innerHeight*0.9,
        selection: false
    });
    this.gameController = new JDGameController({
        tableId: this._id,
        canvas: canvas
    });
    this.gameController.loadGame();
    console.log('JD: Game Initialized');
};