/**
 * Created by vbelolapotkov on 28/04/15.
 */
Template.GameTablesGamePage.onCreated(function () {
    var instance = this;

    instance.gameTable = new GameTable(instance.data.tableId);
    instance.currentPlayer = new ReactiveVar ('No name');
    instance.loggingIn = new ReactiveVar (true);
    instance.loggedIn = new ReactiveVar (false);
    instance.gameStarted = new ReactiveVar(false);
    instance.gameReady = new ReactiveVar(false);

    Meteor.call('checkUserId', function (err, res) {
        if(!err && res.tableId === instance.data.tableId) {
            instance.loggedIn.set(true);
            instance.currentPlayer.set(res.name);
        }
        instance.loggingIn.set(false);
    });

    Tracker.autorun(function () {
        var data = instance.gameTable.getData();
        if(data && data.gameName !== '') instance.gameStarted.set(true);
        else instance.gameStarted.set(false);
    });

    Tracker.autorun(function () {
        if(!instance.gameStarted.get()) return;
        var subs = Meteor.subscribe('gameStarted',instance.gameTable.getData().gameName);
        if(subs.ready()) instance.gameReady.set(true);
        else instance.gameReady.set(false);
    });
});

Template.GameTablesGamePage.helpers({
    'loggingIn': function () {
        return Template.instance().loggingIn.get();
    },
    'loggedIn': function () {
        return Template.instance().loggedIn.get();
    },
    'homeRoute': function (){
        return Routes.home.name.get();
    },
    'playerName': function () {
        return Template.instance().currentPlayer.get();
    },
    'isGameStarted': function () {
        return Template.instance().gameStarted.get();
    },
    'currentGame': function () {
        return Template.instance().gameTable.getData();
    },
    'isGameReady': function () {
        return Template.instance().gameReady.get();
    },
    'currentGameTemplate': function () {
        return Template.instance().gameTable.getGameTemplate();
    },
    "tablePlayers": function () {
        return Template.instance().gameTable.getPlayers();
    },
    "tablePlayersCnt": function () {
        return Template.instance().gameTable.getPlayers().count();
    }
});

Template.GameTablesGamePage.events({
    'click a[name="leaveTableLnk"]': function (e) {
        e.preventDefault();
        Template.instance().gameTable.leaveTable();
        Router.go(Routes.home.name.get());
    }
})