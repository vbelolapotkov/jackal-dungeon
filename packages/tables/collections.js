Tables = new Meteor.Collection('game_tables');
Players = new Meteor.Collection('game_players');
Games = new Meteor.Collection('games_avail');

if(Meteor.isServer) {
    Meteor.publish('gameTablesList', function () {
        return [
            Tables.find(),
            Players.find({},{fields:{tableId:1, nickname:1}})
        ];
    });
    Meteor.publish('tablePlayers', function (tableId) {
        //todo: check if subscriber allowed to view players for supplied tableId
        return Players.find({tableId:tableId});
    });
    Meteor.publish('gamesAvailable', function () {
        return Games.find();
    });
}
