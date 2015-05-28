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
    });
};

JDGameController.prototype.isTableLocked = function () {
    return this.tableController.isTableLocked();
};




//    self.piratesController = new JDPiratesController({
//        tableId: self._id,
//        canvas: self.canvas,
//        mapController: self.mapController
//    });
//    self.gameSync = new JDSynchronizer({
//        tableId: self._id,
//        deckController: self.deckController,
//        tileController: self.tileController,
//        mapController: self.mapController
//    });
//    console.log('JD: Game Initialized');
//})