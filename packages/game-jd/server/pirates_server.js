PiratesController = {};
PiratesController.addNewPirate = function (tableId, nickname) {
    Pirates.insert({
        tableId: tableId,
        nickname: nickname,
        color: PiratesController.pickRandomColor(),
        dCoords: {
            x: 0,
            y: 0
        },
        goldAMT: 0,
        betAMT: 3,
        batAMT: 3
    });
};

PiratesController.pickRandomColor = function () {
    var colors = [
        '#000', //white
        '#fff', //black
        '#f00', //red
        '#0f0', //green
        '#00f', //blue
        '#ff0', //yellow
        '#f0f', //magenta
        '#0ff'  //cyan
    ];
    return colors[Math.floor(Math.random()*8)];
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
        if(pirate) return;
        //insert new pirate
        PiratesController.addNewPirate(player.tableId, player.name);
    }
});



