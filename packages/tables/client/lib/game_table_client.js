/**
 * Created by vbelolapotkov on 27/04/15.
 */

GameTable.prototype.enableEventHandlers = function () {
    /*add method for setting event handlers to current instance*/
    var gameTable = this;
    GameTables.setHandler = function (event, handler) {
        gameTable.on(event, handler);
        console.log(gameTable._eventMap);
    }
}

GameTable.prototype.addPlayer = function (player, callback) {
    var tableId = this._id;
    //todo: add check method to check player params
    Meteor.call('addPlayerToTheTable',this._id,player.nickname,player.pass, function (err, res) {
        callback(err, res);
    });
};

GameTable.prototype.startGame = function (game) {
    Meteor.call('startNewGame', this._id, game, function (err) {
        if(err)console.log(err.reason);
    });
};

GameTable.prototype.leaveTable = function (playerName) {
    console.log(this._eventMap);
    if(this._eventMap['leaveTable']) {
        _.each(this._eventMap['leaveTable'], function (handler) {
            handler();
        });
    };
    Meteor.call('removeFromTable', this._id, playerName, function (err) {
        if(err)console.log(err.reason);
    });
};