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
        self.setPlayersObserver();
    });
};

JDGameController.prototype.isTableLocked = function () {
    return this.tableController.isTableLocked();
};

/*
 * Set observers of game table players collection
 *
 * */
JDGameController.prototype.setPlayersObserver = function () {
    var self = this;
    var playersCursor = GameTables.getPlayersCursor(self.tableId);
    playersCursor.observe({
        changed: function (newDoc, oldDoc) {
            //todo: Observe players collection
            //self.piratesController.changeNickname(oldDoc.nickname, newDoc.nickname);
        },
        removed: function (oldDoc) {
            //todo: Observe players collection
            //self.piratesController.removePirate(oldDoc.nickname);
        }
    });
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