/**
 * Created by vbelolapotkov on 27/04/15.
 */
GameTable = function (tableId) {
    this._id = tableId;
}

GameTable.prototype.getId = function () {
    return this._id;
}

GameTable.prototype.getData = function () {
    return Tables.findOne(this._id);
}

GameTable.prototype.getPlayers = function () {
    return Players.find({tableId: this._id});
}

GameTable.prototype.hasPlayer = function (playerName) {
    return Players.find({tableId: this._id, nickname: playerName}).count() > 0;
}