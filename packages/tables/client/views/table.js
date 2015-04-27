/**
 * Created by vbelolapotkov on 24/04/15.
 */
Template.GameTablesTable.onCreated(function () {
    var instance = this;
    instance.gameTable = new GameTable(this.data._id);
    instance.players = instance.gameTable.getPlayers();
});

Template.GameTablesTable.helpers({
    sitDownLabel: function () {
        return Template.instance().players.count() > 0 ? 'Присоединиться' : 'Сесть за стол'
    },
    players: function () {
        return Template.instance().players;
    },
    playersCnt: function () {
        return Template.instance().players.count();
    }
});

Template.GameTablesTable.events({
    'click button[name="sitDownBtn"]': function (e) {
        var data=this;
        var container = e.currentTarget.parentNode;
        var view = Blaze.renderWithData(Template.GameTablesNewPlayerForm,data, container);
        var modalId = '#addPlayerTo-'+this._id;
        //register event handlers on modal show/hide
        $(modalId).on('hidden.bs.modal', function(){
            Blaze.remove(view);
        });

        $(modalId).modal('show');
    }
})