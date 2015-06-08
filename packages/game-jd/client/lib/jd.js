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
    var ps = Meteor.subscribe('dungeonPirates', self._id, function () {
        console.log('JD: Pirates subscription is ready');
    })
    //subscribe to data if available
    Tracker.autorun(function () {
        if(ms.ready() &&
            ds.ready() &&
            ts.ready() &&
            ps.ready()
        ) {
            //all data ready
            self.dataReady.set(true);
        }
    });
};

JD.prototype.initGame = function (canvasId) {
    console.log('JD: Initializing Game ...');
    //var w = $('#jdGameContainer').width();
    var w = document.getElementById('jdGameContainer');
    var wRect = w.getBoundingClientRect();
    var canvas = new CanvasExt(canvasId, {
        width: w.clientWidth,
        height: window.innerHeight - wRect.top-22,
        selection: false
    });
    this.gameController = new JDGameController({
        tableId: this._id,
        canvas: canvas
    });
    this.gameController.loadGame();
    console.log('JD: Game Initialized');
};