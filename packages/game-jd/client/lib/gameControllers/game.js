JDGameController = function (options) {
    this.tableId = options.tableId;
    this.canvas = options.canvas;
    this.currentPirate = this.setCurrentPirate(options.currentPirateId);
};

JDGameController.prototype.loadGame = function () {
    var self = this;
    var opts = {
        tableId: self.tableId,
        canvas: self.canvas,
        gameController: self
    }
    self.dungeonController = new DungeonController(opts);
    self.dungeonController.loadMap(function (success) {
        if(!success) {
            console.error('Failed to load game');
            return;
        }
        self.deckController = new DeckController(opts);
        self.deckController.loadDeck();
        self.tableController = new TableController(opts);
        self.piratesController = new PiratesController(opts);
        self.goldController = new GoldController(opts);
    });
};

JDGameController.prototype.isTableLocked = function () {
    return this.tableController.isTableLocked();
};

/*
* Set current pirate id;
* */
JDGameController.prototype.setCurrentPirate = function (id) {
    this.currentPirate = Pirates.findOne(id, {reactive: false});
};

JDGameController.prototype.releaseResources = function () {
    this.goldController.releaseResources();
    this.piratesController.releaseResources();
    this.tableController.releaseResources();
    this.deckController.releaseResources();
    this.dungeonController.releaseResources();
    this.currentPirate = undefined;
};

/*
 * @return - absolute coords
 * @rel - relative coords
 * @ref - reference point
 * */
JDGameController.rel2abs = function  (rel, ref) {
    return {
        left: rel.left + ref.left,
        top: rel.top + ref.top
    };
};

/*
 * @return - relative coords
 * @abs - absolute coords
 * @ref - reference point
 * */
JDGameController.abs2rel = function  (abs, ref) {
    return {
        left: abs.left - ref.left,
        top: abs.top - ref.top
    }
}