/**
 * Created by vbelolapotkov on 12/05/15.
 */
JDSynchronizer = function (options) {
    this.tableId = options.tableId;
    this.deckController = options.deckController;
    this.tileController = options.tileController;

    this.setTableObserver();
}

JDSynchronizer.prototype.setTableObserver = function () {
    var self = this;
    var tilesOnTable = Tiles.find({
        tableId:self.tableId,
        location: 'onTable'
    });
    self.tableObserver = tilesOnTable.observe({
        added: function (doc) {
            self.deckController.lock();
            self.tileController.addedTileOnTable(doc);
        },

        changed: function (newDoc, oldDoc) {
            self.tileController.changedTileOnTable(newDoc, oldDoc);
        },
        removed: function (oldDoc) {
            self.tileController.removedTileFromTable(oldDoc);
            self.deckController.unlock();
        }
    });
};