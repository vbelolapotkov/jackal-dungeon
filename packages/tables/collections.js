Tables = new Meteor.Collection('game_tables');
Players = new Meteor.Collection('game_players');

if(Meteor.isServer) {
    Meteor.publish('gameTablesList', function () {
        return [
            Tables.find(),
            Players.find({},{fields:{tableId:1, nickname:1}})
        ];
    });
    Meteor.publish('gamePlayers', function (tableId) {
        //todo: check if subscriber allowed to view players for supplied tableId
        return Players.find({tableId:tableId});
    });
}
