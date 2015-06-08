/**
 * Created by vbelolapotkov on 08/06/15.
 */
Meteor.methods({
    JDDiceRoll: function (options) {
        var user = GameTables.parseUserId(this.userId);
        var pirate = Pirates.findOne({
            tableId: user.tableId,
            nickname: user.name
        });
        if(!pirate) throw new Meteor.Error(403, 'Unauthorized action forbidden.');

        var doc = {
            tableId: user.tableId,
            d1: dice(),
            d2: options.dual ? dice() : null,
            ownerId: pirate._id,
            ownerName: pirate.nickname,
            competition: options.competition ? true: false
        };

        Dice.insert(doc, function (err) {
            if(err)
                throw new Meteor.Error(503, 'Failed to insert dice roll result: '+err.reason);
        });
    }
});


function dice() {
    return Math.floor(Math.random()*6+1);
}

