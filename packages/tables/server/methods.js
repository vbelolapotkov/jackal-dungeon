Meteor.methods({
    'addPlayerToTheTable': function (tableId, name, pass) {
        var tableInfo = Tables.findOne(tableId);
        if(!tableInfo) throw new Meteor.Error(404, 'Table not found');

        var players = tableInfo.players;
        if(_.contains(players,name)) {
            //check existing player pass
            if (!checkPlayerPass(tableId, name, pass))
                throw new Meteor.Error(401, 'Wrong password');
            return true;
        }
        else {
            //add new player
            if(!addNewPlayer(tableId,name, pass))
                throw new Meteor.Error(501, 'Failed to add player');
            return true;
        }
    }
});

function checkPlayerPass (tableId, name, pass) {
    var player = Players.findOne({tableId: tableId, nickname: name});
    if(!player) return false;
    return player.password === pass;
}

function addNewPlayer (tableId, name, pass) {
    var id = Players.insert({
        tableId: tableId,
        nickname: name,
        password: pass
    });
    if(!id) return false;
    return Tables.update(tableId, {$push: {players:name}}) > 0;
}