//global game object
JD = function (tableId) {
    this._id = tableId || 'demoGame';
    this.dataReady = new ReactiveVar(false);
    var self = this;
    //subscribe to data if available
    Meteor.subscribe('dungeonMap', self._id, function () {
        //mapSubscription is ready
        Meteor.subscribe('tilesDeck', self._id, function () {
            //deck subscription is ready
            self.dataReady.set(true);
        });
        Meteor.subscribe('tilesOnTable', self._id);
    });
};

JD.prototype.initGame = function (canvasId) {
    var self = this;
    self.canvas = new fabric.Canvas(canvasId);
    self.canvas.setWidth(window.innerWidth*0.9);
    self.canvas.setHeight(window.innerHeight*0.9);

    self.deck = new Deck(self._id,self.canvas);
    self.setTableObserver();
};

JD.prototype.setTableObserver = function () {
    var self = this;
    var tilesOnTable = Tiles.find({
        tableId:self._id,
        location: 'onTable'
    });
    this.tableObserver = tilesOnTable.observe({
        added: self.addedTileOnTable.bind(self),
        changed: self.changedTileOnTable.bind(self),
        removed: self.removedTileFromTable.bind(self)
    });
};

JD.prototype.addedTileOnTable = function (doc) {
    //todo: add animation for add action
    var self = this;
    //prevent form adding new tile on table
    self.deck.lock();
    var tileOpts = {
        url:doc.imgUrl,
        id: doc.tileId,
        left: self.deck.tileContainer.getLeft(),
        top: self.deck.tileContainer.getTop()
    };
    Tile.fromURL(tileOpts, function (tile) {
        self.tileOnTable = tile;
        self.tileOnTable.on('modified', function (options) {
            console.log(options);
        });
        self.canvas.add(self.tileOnTable);
        var parent = document.getElementById('jdGameContainer');
        self.tileControlsInstance = Blaze.renderWithData(Template.JDTileControls, self.tileOnTable, parent);
    })
};

JD.prototype.changedTileOnTable = function (newDoc, oldDoc) {
    console.log('Changed on table:');
    console.log(newDoc);
};

JD.prototype.removedTileFromTable = function (oldDoc) {
    var self=this;
    console.log('Removed from table:');
    console.log(oldDoc);
    if(self.tileOnTable.id === oldDoc.tileId) {
        self.canvas.remove(self.tileOnTable);
        self.tileOnTable = undefined;
    }
    else {
        //todo: find tile on canvas and remove
        //backdoor if something is going wrong
        console.log('trying to find tile on canvas');
    }
    self.deck.unlock();
};