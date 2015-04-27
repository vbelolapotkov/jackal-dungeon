/**
 * Created by vbelolapotkov on 24/04/15.
 */
Template.GameTablesTable.helpers({
    sitDownLabel: function () {
        return this.state === 'Занят' ? 'Присоединиться' : 'Сесть за стол'
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