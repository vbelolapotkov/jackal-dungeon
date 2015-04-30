Meteor.methods({
    'addPlayerToTheTable': function (tableId, name, pass) {
        var gameTable = new GameTable(tableId);
        var tableInfo = gameTable.getData();
        if(!tableInfo) throw new Meteor.Error(404, 'Table not found');

        if(gameTable.hasPlayer(name)) {
            if (!gameTable.checkPlayerPass(name, pass))
                throw new Meteor.Error(401, 'Wrong password');
        }
        else {
            //add new player
            if(!gameTable.addNewPlayer(name, pass))
                throw new Meteor.Error(501, 'Failed to add player');
        }
        //set userId to connection
        var userId = name + '@' + tableId;
        this.setUserId(userId);
    },
    'checkUserId': function () {
        var error = new Meteor.Error(401, 'Unauthorized');
        if (!this.userId) throw error;
        var gameTable = new GameTable('1');
        return gameTable.parseUserId(this.userId);
    },
    'startNewGame': function (tableId, game) {
        var gameTable = new GameTable(tableId);
        var userData = gameTable.parseUserId(this.userId);
        if(!userData || userData.tableId !== tableId) throw new Meteor.Error(401, 'Unauthorized');
        if(gameTable.startGame(game) < 1) throw new Meteor.Error(503, 'Failed to start new game');
    },
    'removeFromTable': function (tableId, playerName) {
        var gameTable = new GameTable(tableId);
        var userData = gameTable.parseUserId(this.userId);
        if(!userData || userData.tableId !== tableId) throw new Meteor.Error(401, 'Unauthorized');

        var nickname = playerName || userData.name;
        gameTable.leaveTable(nickname);
    }
});

