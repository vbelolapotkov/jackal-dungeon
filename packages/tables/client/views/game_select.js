/**
 * Created by vbelolapotkov on 29/04/15.
 */
Template.GameTablesGameSelect.onCreated(function () {
    var instance = this;
    instance.gameTable = new GameTable(this.data.tableId);
    instance.gameListReady = new ReactiveVar(false);

    //subscribe to gamesList
    Tracker.autorun(function () {
        var subs = Meteor.subscribe('gamesAvailable');
        if(subs.ready()) instance.gameListReady.set(true);
        else instance.gameListReady.set(false);
    });
});

Template.GameTablesGameSelect.helpers({
    'isGameListReady': function () {
        return Template.instance().gameListReady.get();
    },
    'gameInList': function () {
        //todo: move direct db read from helper to some object
        return Games.find();
    }
});

Template.GameTablesGameSelect.events({
    'click button[name="startGameBtn"]': function (e) {
        console.log(this);
        var game = {
            gameName: this.gameName,
            gameDisplayName: this.displayName
        };
        Template.instance().gameTable.startGame(game);
    }
})