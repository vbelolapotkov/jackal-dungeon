PiratesController = {};
PiratesController.addNewPirate = function (tableId, nickname) {
    var cnt = Pirates.find({tableId: tableId}).count();
    return Pirates.insert({
        tableId: tableId,
        nickname: nickname,
        color: PiratesController.pickColor(cnt),
        dCoords: {
            x: 0,
            y: 0
        },
        goldAMT: 0,
        betAMT: 3,
        batAMT: 3
    });
};

PiratesController.pickColor = function (cnt) {
    var colors = [
        '#00f', //blue
        '#ff0', //yellow
        '#f00', //red
        '#0f0', //green
        '#f0f', //magenta
        '#0ff',  //cyan
        '#fff', //black
        '#000' //white
    ];
    return colors[cnt % colors.length];
};

Meteor.methods({
    /*
    * Checks if current player already in Pirates collection.
    * If not add new pirate.
    * */
    'PirateCheckMeIn': function () {
        var player = GameTables.parseUserId(this.userId);
        if(!player || !player.tableId || !player.name) return;

        var pirate = Pirates.findOne({tableId: player.tableId, nickname: player.name});
        //do nothing Pirate already in game
        if(pirate) return pirate._id;
        //insert new pirate
        return PiratesController.addNewPirate(player.tableId, player.name);
    },
    'PirateCheckMeOut': function () {
        var player = GameTables.parseUserId(this.userId);
        if(!player || !player.tableId || !player.name) return;

        var pirate = Pirates.findOne({tableId: player.tableId, nickname: player.name});
        if(!pirate) throw new Meteor.Error(404, 'Failed to checkout pirate: Not found.');

        Dice.remove({ownerId: pirate._id}, function (err) {
            if(err) console.log(err.reason);
        });
        var cnt = Tiles.update({ownerId: pirate._id, location: 'onTable'}, {$set: {location: 'inDeck'}});
        if (cnt > 0) DeckController.shuffle(pirate.tableId);
        Pirates.remove({_id:pirate._id});

        var piratesCnt = Pirates.find({tableId: player.tableId}).count();
        if(piratesCnt > 0) return;
        //no pirates left delete tiles
        Tiles.remove({tableId: player.tableId});
    },
    'PiratePutGold': function () {
        var player = GameTables.parseUserId(this.userId);
        if(!player || !player.tableId || !player.name)
            throw new Meteor.Error(401, 'Unauthorized action');

        var pirate = Pirates.findOne({tableId: player.tableId, nickname: player.name});
        if(!pirate) throw new Meteor.Error(404, 'Pirate not found');

        var tileDoc = Tiles.findOne({
            tableId: pirate.tableId,
            dCoords: pirate.dCoords
        });

        if(!tileDoc) throw new Meteor.Error(404, 'Tile not found');
        if(tileDoc.hasGold) throw new Meteor.Error(403, 'Tile already has gold');

        Tiles.update(tileDoc._id,{$set:{hasGold: true}}, function (err) {
            if(err) throw new Meteor.Error(503, 'Error in updating tileDoc: '+err.reason);
            else Pirates.update(pirate._id, {$inc:{goldAMT:-1}}, function (err) {
                if(err) throw new Meteor.Error(503, 'Error in updating pirate goldAMT: '+err.reason);
            });
        });

    }
});



