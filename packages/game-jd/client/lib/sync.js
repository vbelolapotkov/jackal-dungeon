/**
 * Created by vbelolapotkov on 12/05/15.
 */
JDSynchronizer = function (options) {
    this.tableId = options.tableId;
    this.deckController = options.deckController;
    this.tileController = options.tileController;
    this.mapController = options.mapController;

    this.setTableObserver();
    this.setMapObserver();
};

JDSynchronizer.prototype.setTableObserver = function () {
    var self = this;
    var tilesOnTable = Tiles.find({
        tableId:self.tableId,
        location: 'onTable'
    });
    self.tableObserver = tilesOnTable.observe({
        added: function (doc) {
            self.tileController.dbAddedTileOnTable(doc);
        },

        changed: function (newDoc, oldDoc) {
            self.tileController.dbChangedTileOnTable(newDoc, oldDoc);
        },
        removed: function (oldDoc) {
            self.tileController.dbRemovedTileFromTable(oldDoc);
        }
    });
};

JDSynchronizer.prototype.setMapObserver = function () {
    var self = this;
    var tilesOnMap = Tiles.find({
        tableId: self.tableId,
        location: 'onMap'
    });
    self.mapObserver = tilesOnMap.observe({
        added: function (doc) {
            self.mapController.addedTileOnMap(doc);
        }
    });
};