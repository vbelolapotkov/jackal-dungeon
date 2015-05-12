/**
 * Created by vbelolapotkov on 30/04/15.
 */
Template.GameJDMain.onCreated(function () {
    var tableId = this.data ? this.data.tableId : '';
    this.game = new JD(tableId);
});

Template.GameJDMain.onRendered(function () {
    var game = this.game;
    Tracker.autorun(function () {
        if(game.dataReady.get()){
            game.initGame('jackalCanvas');
        }
        //todo: show spinner while loading game data
    });
});