JDGameController = function (options) {
    this.tableId = options.tableId;
    this.canvas = options.canvas;

};

JDGameController.prototype.loadGame = function () {
    var self = this;
    var opts = {
        tableId: self.tableId,
        canvas: self.canvas,
        gameController: self
    }
    self.DungeonController = new DungeonController(opts);
    self.DungeonController.loadMap(function (success) {
        if(!success) {
            console.error('Failed to load game');
            return;
        }
        self.deckController = new DeckController(opts);
        self.deckController.loadDeck();
        self.tableController = new TableController(opts);
        self.piratesController = new PiratesController(opts);
    });
};

JDGameController.prototype.isTableLocked = function () {
    return this.tableController.isTableLocked();
};