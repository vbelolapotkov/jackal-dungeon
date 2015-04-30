/**
 * Created by vbelolapotkov on 27/04/15.
 */
GameTable.prototype.addNewPlayer = function (name, pass) {
    var tableId = this._id;
    var id = Players.insert({
        tableId: tableId,
        nickname: name,
        password: pass
    });
    return id;
};

GameTable.prototype.checkPlayerPass = function (name, pass) {
    var tableId = this._id;
    var player = Players.findOne({tableId: tableId, nickname: name});
    if(!player) return false;
    return player.password === pass;
}

GameTable.prototype.parseUserId = function (userId) {
    check(userId, String);

    var sepPosition = userId.indexOf('@');
    if (sepPosition < 0) return;

    var name = userId.slice(0,sepPosition);
    var tableId = userId.slice(sepPosition+1);
    return {tableId: tableId, name: name};
};

GameTable.prototype.startGame = function (game) {
    return Tables.update(this._id,
        {$set: {
            gameName: game.gameName,
            gameDisplayName: game.gameDisplayName
        }});
}

GameTable.prototype.leaveTable = function (nickname) {
    var tableId = this._id;
    var cnt = this.getPlayers().count();
    Players.remove({tableId: this._id, nickname: nickname}, function(err, num){
        if(!err && num === cnt) {
            //reset game name when last player leaves the table
            Tables.update(tableId, {$set: {gameName:'', gameDisplayName:''}});
        }
    });
}
