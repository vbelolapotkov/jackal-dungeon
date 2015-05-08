/**
 * Created by vbelolapotkov on 04/05/15.
 */
Deck = function (tableId,canvas) {
    //set instance variables
    this.tableId = tableId;
    this.canvas = canvas;

    //add containers for deck and new tiles
    this.deckContainer = new EmptyTile({left:60, top:60});
    this.tileContainer = new EmptyTile({left:170, top: 60});
    this.canvas.add(this.deckContainer);
    this.canvas.add(this.tileContainer);

    //show deck as tile back img
    this.tiles = Tiles.find({
        tableId:tableId,
        type: {$ne: 'back'},
        location: 'inDeck'
    },{
        sort:{dIndex: -1},
        limit: 1
    });
    var backUrl = Tiles.findOne({tableId: tableId, type: 'back'}).backUrl;
    var backTileOptions = {
        url: backUrl,
        id: 0,
        left: this.deckContainer.getLeft(),
        top: this.deckContainer.getTop(),
        selectable: false
    };
    var self = this;

    Tile.fromURL(backTileOptions, function (tile) {
        //add event handler for tile in deck
        tile.on('mouseup', self.getFromTop.bind(self));
        self.backTile = tile;
        self.addBackTile();
    });
};

Deck.prototype.addBackTile = function () {
    var c = this.canvas;
    var bt = this.backTile;
    c.add(bt);
};

Deck.prototype.getFromTop = function () {
    var self = this;
    if(self.isLocked) {
        console.log('Cannot take new tile: locked');
        return;
    }

    //Move tile from deck to table
    Meteor.call('DeckGetFromTop',self.tableId, function (err) {
        if(err) console.log(err.reason);
    });
};

Deck.prototype.lock = function () {
    this.isLocked = true;
};

Deck.prototype.unlock = function () {
    this.isLocked = false;
};