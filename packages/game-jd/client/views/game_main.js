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
        else self.currentPirateId.set(result);
    });
});

Template.GameJDMain.onRendered(function () {
    console.log('Main: template rendered');
    var game = this.game;
    Tracker.autorun(function (c) {
        if(game.dataReady.get()){
            game.initGame('jackalCanvas');
        }
        //todo: show spinner while loading game data
    });
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