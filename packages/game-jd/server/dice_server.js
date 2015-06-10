/**
 * Created by vbelolapotkov on 08/06/15.
 */
Meteor.methods({
    JDDiceRoll: function (options) {
        //check arguments
        var pattern = {
            dual: Boolean,
            competition: Match.Optional(Boolean),
            competitionId: Match.Optional(String)
        };
        check(options, pattern);

        //check user
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

        //add fields to doc if it's competition
        if(options.competition) {
            //perform competition checks
            var competition = Dice.findOne(options.competitionId);
            if(!competition) throw new Meteor.Error(404, 'Competition not found');
            //1. Check if current pirate in competition
            if(pirate._id !== competition.offenderId && pirate._id !== competition.defenderId)
                throw new Meteor.Error(403, 'Forbidden to roll the dice if not in a competition');
            //2. Check current number of attempts
            var attempts = Dice.find({competitionId: competition._id, ownerId: pirate._id}).count();
            var competitionRound = attempts+1;
            //only three attempts allowed
            if(competitionRound > 3) return;

            doc.competitionId = options.competitionId;
            doc.competitionRound = competitionRound;
        }

        Dice.insert(doc, function (err) {
            if(err)
                throw new Meteor.Error(503, 'Failed to insert dice roll result: '+err.reason);
        });
    },
    JDBeginCompetition: function (options) {
        //check arguments
        var pattern = {
            type: Match.Where(function (type) {
                return type === 'bet' || type === 'bat';
            }),
            offenderId: String,
            defenderId: String
        };
        check(options, pattern);

        //check current user
        var user = GameTables.parseUserId(this.userId);
        var pirate = Pirates.findOne({
            tableId: user.tableId,
            nickname: user.name
        });
        if(!pirate) throw new Meteor.Error(403, 'Unauthorized action forbidden.');
        if(options.offenderId !== pirate._id)
            throw new Meteor.Error(403, 'Forbidden. Begin competition on behalf of other pirate');

        //check defender
        var defender = Pirates.findOne(options.defenderId);
        if(!defender) throw new Meteor.Error(404, 'Defender for competition not found');

        //check if there is existing competition
        var activeCompCnt = Dice.find({
            tableId: user.tableId,
            competition: true
        }).count();
        if(activeCompCnt > 0) throw new Meteor.Error(403, 'There is at least one active competition');

        //create new competition record
        Dice.insert({
            tableId: user.tableId,
            competition: true,
            competitionType: options.type,
            offenderId: pirate._id,
            offenderName: pirate.nickname,
            defenderId: defender._id,
            defenderName: defender.nickname
        });
    },
    JDEndCompetition: function (competitionId) {
        check(competitionId, String);
        var user = GameTables.parseUserId(this.userId);
        var pirate = Pirates.findOne({
            tableId: user.tableId,
            nickname: user.name
        });
        if(!pirate) throw new Meteor.Error(403, 'Unauthorized action forbidden.');

        var competition = Dice.findOne(competitionId);
        if(!competition) throw new Meteor.Error(404, 'Competition not found');

        if(pirate.tableId !== competition.tableId)
            throw new Meteor.Error(403, 'Table interference forbidden');

        //remove rolls and competition object
        Dice.remove({competitionId: competition._id});
        Dice.remove(competition._id);
    }
});


function dice() {
    return Math.floor(Math.random()*6+1);
}

