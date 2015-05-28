/**
 * Created by vbelolapotkov on 04/05/15.
 */
DeckController = function (options) {
    //todo: add deck observer to monitor tiles returned to deck
    //set instance variables
    this.tableId = options.tableId;
    this.deckController = new cTileController (options.canvas);
    this.deckLoaded = false;
    this.deckEmpty = true;
    this.gameController = options.gameController;
    //add containers for deckController and new tiles
    this.deckController.createContainer({left:60, top:60});
};

/*
* @side_effect - display container and load tiles
* */
DeckController.prototype.loadDeck = function () {
    this.tilesCursor = Tiles.find({
        tableId: this.tableId,
        type: {$ne: 'back'},
        location: 'inDeck'
    },{reactive: false});
    if(this.tilesCursor.count()>0) {
        this.showDeck();
        this.setDeckObserver();
    }
};
/*
 * @side_effect - sets observer for tiles in deck
 * */
DeckController.prototype.setDeckObserver = function () {
    var self = this;
    var tilesInDeck = self.tilesCursor;
    //todo: fix deck observer. Unstable
    this.deckObserver = tilesInDeck.observe({
        added: function (doc) {
            self.shuffle();
            self.checkEmpty();
        },
        removed: this.checkEmpty.bind(this)
    });
};

/*
* @side_effect - create deckTile and add to canvas. Sets event handler on deckTile.
* */
DeckController.prototype.showDeck = function () {
    var self = this;
    //display deck as tile back img
    var backUrl = Tiles.findOne({tableId: self.tableId, type: 'back'},{reactive: false}).backUrl;
    var opts = {
        url: backUrl,
        id: '0',
        selectable: false
    };

    self.deckController.addNewTile(opts, function (tile) {
        //add event handler for click on deck
        tile.on('mouseup', self.getFromTop.bind(self));
        self.deckLoaded = true;
        self.deckEmpty = false;
    });
};

/*
* @side_effect removes deckTile from canvas
* */
DeckController.prototype.hideDeck = function () {
    var tile = this.deckController.findById('0');
    tile.remove();
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
DeckController.prototype.checkEmpty = function () {
    var cnt = this.tilesCursor.count();
    if(cnt === 0) {
        this.hideDeck();
        this.deckEmpty = true;
        return;
    }
    if (this.deckEmpty && cnt>0) this.showDeck();
}