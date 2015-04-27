Tables = new Meteor.Collection('game_tables');
Players = new Meteor.Collection('game_players');

if(Meteor.isServer) {
    Meteor.publish('gameTablesList', function () {
        return Tables.find();
    });
    Meteor.publish('gamePlayers', function (tableId) {
        //todo: check if subscriber allowed to view players for supplied tableId
        return Players.find({tableId:tableId});
    });
}
