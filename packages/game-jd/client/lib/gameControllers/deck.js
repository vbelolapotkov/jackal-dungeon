/**
 * Created by vbelolapotkov on 04/05/15.
 */
JDDeckController = function (tableId,canvas) {
    //todo: add deck observer to monitor tiles returned to deck
    //set instance variables
    this.tableId = tableId;
    this.deckController = new cTileController (canvas);
    this.deckLoaded = false;
    this.deckEmpty = true;

    //this.loadDeck(); //may be this should be called externally
};

JDDeckController.prototype.loadDeck = function () {
    //add containers for deckController and new tiles
    this.deckController.createContainer({left:60, top:60});

    this.tilesCursor = Tiles.find({
        tableId: this.tableId,
        type: {$ne: 'back'},
        location: 'inDeck'
    },{reactive: false});
    if(this.tilesCursor.count()>0) this.showDeck();
};

JDDeckController.prototype.showDeck = function () {
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
        var eventMap = [{
            name: 'mouseup',
            handler: self.getFromTop.bind(self)
        }];
        self.deckController.addEventHandlers(tile, eventMap);
        self.deckLoaded = true;
        self.deckEmpty = false;
    });
};

JDDeckController.prototype.hideDeck = function () {
    this.deckController.remove('0');
};

JDDeckController.prototype.getFromTop = function () {
    var self = this;
    if(self.isTableLocked) {
        console.log('Cannot take new tile: locked');
        return;
    }
    self.lock();
    //Move tile from deckController to table
    Meteor.call('DeckGetFromTop',self.tableId, function (err) {
        if(err) {
            console.log(err.reason);
            self.unlock();
        }
    });
};

JDDeckController.prototype.shuffle = function () {
    Meteor.call('DeckShuffle', this.tableId, function (err) {
        if(err) console.log(err.reason);
    });
};

JDDeckController.prototype.checkEmpty = function () {
    var cnt = this.tilesCursor.count();
    if(cnt === 0) {
        this.hideDeck();
        this.deckEmpty = true;
        return;
    }
    if (this.deckEmpty && cnt>0) this.showDeck();
}

JDDeckController.prototype.lock = function () {
    this.isTableLocked = true;
};

JDDeckController.prototype.unlock = function () {
    this.isTableLocked = false;
};