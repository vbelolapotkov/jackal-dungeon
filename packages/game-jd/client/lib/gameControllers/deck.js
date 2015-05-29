/**
 * Created by vbelolapotkov on 04/05/15.
 */
DeckController = function (options) {
    //set instance variables
    this.tableId = options.tableId;
    this.canvas = options.canvas;
    this.deckController = new cTileController (options.canvas);
    this.deckHidden = true;
    this.gameController = options.gameController;

    //add containers for deckController and new tiles
    this.deckController.createContainer({left:60, top:60});
};

/*
* @side_effect - display container and load tiles
* */
DeckController.prototype.loadDeck = function () {
    var self = this;

    //display deck as tile back img
    var backUrl = Tiles.findOne({tableId: self.tableId, type: 'back'},{reactive: false}).backUrl;
    var coords = self.deckController.container.getCoords();
    var opts = {
        url: backUrl,
        id: '0',
        selectable: false,
        left: coords.left,
        top: coords.top
    };

    cTile.fromURL(opts, function (deckTile) {
        deckTile.on('mouseup', self.getFromTop.bind(self));
        self.deckTile = deckTile;
        self.setDeckObserver();
    });
};
/*
 * @side_effect - sets observer for tiles in deck
 * */
DeckController.prototype.setDeckObserver = function () {
    var self = this;
    self.tilesInDeck = Tiles.find({
            tableId: self.tableId,
            type: {$ne: 'back'},
            location: 'inDeck'
        });
    this.deckObserver = self.tilesInDeck.observe({
        added: function () {
            self.shuffle();
            if(self.deckHidden)
                self.showDeck();


        },
        removed: function () {
            if(self.deckIsEmpty())
                self.hideDeck();
        }
    });
};

/*
* @side_effect - add deckTile to canvas.
* */
DeckController.prototype.showDeck = function () {
    if(!this.deckTile) return;
    this.canvas.add(this.deckTile);
    this.deckHidden = false;
};

/*
* @side_effect removes deckTile from canvas
* */
DeckController.prototype.hideDeck = function () {
    if(!this.deckTile) return;
    this.deckTile.remove();
    this.deckHidden = true;
};

/*
* @side_effect gets top tile from deck and puts it on Table (on server side)
* */
DeckController.prototype.getFromTop = function () {
    var self = this;
    if(self.gameController.isTableLocked()) {
        console.log('Cannot take new tile: locked');
        return;
    }
    //Move tile from deckController to table
    Meteor.call('DeckGetFromTop',self.tableId, function (err) {
        if(err) {
            console.log(err.reason);
        }
    });
};

/*
* @side_effect asks server to shuffle the deck
* */
DeckController.prototype.shuffle = function () {
    Meteor.call('DeckShuffle', this.tableId, function (err) {
        if(err) console.log(err.reason);
    });
};

/*
* @side_effect - checks deck tiles cnt and shows or hides deck tile
* */
DeckController.prototype.deckIsEmpty = function () {
    return this.tilesInDeck.count() === 0;
};