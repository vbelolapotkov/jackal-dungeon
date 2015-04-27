Meteor.methods({
    'addPlayerToTheTable': function (tableId, name, pass) {
        var gameTable = new GameTable(tableId);
        var tableInfo = gameTable.getData();
        if(!tableInfo) throw new Meteor.Error(404, 'Table not found');

        if(gameTable.hasPlayer(name)) {
            if (!gameTable.checkPlayerPass(name, pass))
                throw new Meteor.Error(401, 'Wrong password');
            return true;
        }
        else {
            //add new player
            if(!gameTable.addNewPlayer(name, pass))
                throw new Meteor.Error(501, 'Failed to add player');
            return true;
        }
    }
});

