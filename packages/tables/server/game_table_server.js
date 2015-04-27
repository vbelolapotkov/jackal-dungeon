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

