//global game object
JD = function (tableId) {
    this._id = tableId || 'demoGame';
    this.dataReady = new ReactiveVar(false);
    var self = this;
    this.subs = Object.create(null);
    this.subs.ms = Meteor.subscribe('dungeonMap', self._id, function () {
        console.log('JD: Map subscription is ready');
    });
    this.subs.ds = Meteor.subscribe('tilesDeck', self._id, function () {
        console.log('JD: Deck subscription is ready');
    });
    this.subs.ts = Meteor.subscribe('tilesOnTable', self._id, function () {
        console.log('JD: Table subscription is ready');
    });
    this.subs.ps = Meteor.subscribe('dungeonPirates', self._id, function () {
        console.log('JD: Pirates subscription is ready');
    });
    this.subs.dis = Meteor.subscribe('tableDice', self._id, function () {
        console.log('JD: Dice subscription is ready');
    });
    //subscribe to data if available
    Tracker.autorun(function () {
        if(self.subs.ms.ready() &&
            self.subs.ds.ready() &&
            self.subs.ts.ready() &&
            self.subs.ps.ready() &&
            self.subs.dis.ready()
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
    Blaze.renderWithData(Template.JDDice,{tableId: this._id}, w);
    this.gameController = new JDGameController({
        tableId: this._id,
        canvas: canvas,
        currentPirateId: this.currentPirateId
    });
    this.gameController.loadGame();
    console.log('JD: Game Initialized');
};

JD.prototype.setCurrentPirate = function (id) {
    this.currentPirateId = id;
    if(this.gameController) this.gameController.setCurrentPirate(id);
};

JD.prototype.releaseResources = function () {
    //release game resources
    this.gameController.releaseResources();
    //stop subscriptions
    _.each(this.subs, function (sub) {
        sub.stop();
    });
};
