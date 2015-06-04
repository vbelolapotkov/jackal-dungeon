/**
 * Created by vbelolapotkov on 30/04/15.
 */
Template.GameJDMain.onCreated(function () {
    var tableId = this.data ? this.data._id : '';
    this.game = new JD(tableId);
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