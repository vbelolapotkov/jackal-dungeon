/**
 * Created by vbelolapotkov on 27/04/15.
 */


GameTable.prototype.addPlayer = function (player, callback) {
    var tableId = this._id;
    //todo: add check method to check player params
    Meteor.call('addPlayerToTheTable',this._id,player.nickname,player.pass, function (err, res) {
        callback(err, res);
    });
}

