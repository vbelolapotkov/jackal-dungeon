/**
 * Created by vbelolapotkov on 27/04/15.
 */
GameTable = function (tableId) {
    this._id = tableId;
    this._data = Tables.find(tableId);
    this._eventMap = Object.create(null);
};

GameTable.prototype.getId = function () {
    return this._id;
};

GameTable.prototype.getData = function () {
    return this._data.fetch()[0];
};

GameTable.prototype.getPlayers = function () {
    return Players.find({tableId: this._id});
};

GameTable.prototype.hasPlayer = function (playerName) {
    return Players.find({tableId: this._id, nickname: playerName}).count() > 0;
};

GameTable.prototype.getGameTemplate = function () {
    var data = this._data.fetch()[0];
    var gameInfo = Games.findOne({gameName: data.gameName});
    if(gameInfo) return gameInfo.gameTemplate;
};

/*
* Set event handlers to instance
* */
GameTable.prototype.on = function (eventName, handler) {
    if(typeof  eventName !== 'string' || typeof handler !== 'function') return;
    if(!this._eventMap[eventName]) this._eventMap[eventName] = [];
    this._eventMap[eventName].push(handler);
};

/*
* Reset event handlers for eventName
* */
GameTable.prototype.off = function (eventName) {
    if(!eventName || typeof eventName !== 'String') {
        //reset all handlers
        this._eventMap = Object.create(null);
    }
    else if(this._eventMap[eventName]) this._eventMap[eventName] = [];
};