/**
 * Created by vbelolapotkov on 30/04/15.
 */
Template.GameJDMain.onCreated(function () {
    var tableId = this.data ? this.data._id : '';
    this.game = new JD(tableId);
    this.currentPirateId = new ReactiveVar();
    var self = this;
    Meteor.call('PirateCheckMeIn', function (err, result) {
        if(err) console.error('JD Game Error:' + err.reason);
        else {
            self.currentPirateId.set(result);

            GameTables.setHandler('leaveTable', function () {
                Meteor.call('PirateCheckMeOut');
            });
        }
    });
});

Template.GameJDMain.onRendered(function () {
    var self = this;
    Tracker.autorun(function (c) {
        if(self.game.dataReady.get() && self.currentPirateId.get()){
            self.game.initGame('jackalCanvas', self.currentPirateId.get());
        }
        //todo: show spinner while loading game data
    });
});

Template.GameJDMain.onDestroyed(function () {
    console.log('Releasing game resources...');
    this.game.releaseResources();
    console.log('Game resources released.');
});


Template.GameJDMain.helpers({
    currentPirate: function () {
        return Pirates.findOne(Template.instance().currentPirateId.get());
    },
    activeCompetition: function () {
        return Dice.findOne({
            tableId: this.tableId,
            competition: true,
            competitionType: {$ne:null}
        });
    }
});