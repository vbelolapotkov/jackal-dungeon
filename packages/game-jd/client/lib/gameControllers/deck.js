/**
 * Created by vbelolapotkov on 04/05/15.
 */
JDDeckController = function (tableId,canvas) {
    //todo: add deck observer to monitor tiles returned to deck
    //set instance variables
    var self = this;
    self.tableId = tableId;
    self.deckController = new cTileController (canvas);

    //add containers for deckController and new tiles
    self.deckController.createContainer({left:60, top:60});

    //display deck as tile back img
    self.tiles = Tiles.find({
        tableId:tableId,
        type: {$ne: 'back'},
        location: 'inDeck'
    },{
        sort:{dIndex: -1},
        limit: 1
    });
    var backUrl = Tiles.findOne({tableId: tableId, type: 'back'}).backUrl;
    self.deckController.createDeck(backUrl, function (tile) {
        //add event handler for click on deck
        var eventMap = [{
            name: 'mouseup',
            handler: self.getFromTop.bind(self)
        }];
        self.deckController.addEventHandlers(tile, eventMap);
    });
};

JDDeckController.prototype.getFromTop = function () {
    var self = this;
    if(self.isLocked) {
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

JDDeckController.prototype.lock = function () {
    this.isLocked = true;
};

JDDeckController.prototype.unlock = function () {
    this.isLocked = false;
};