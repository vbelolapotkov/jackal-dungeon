/**
 * Created by vbelolapotkov on 09/06/15.
 */
Template.JDPirateInfo.onRendered(function() {
    //set data-current-pirate = true if current pirate template
    if(this.data._id !== Template.parentData(1)._id) return;

    this.$('.jd-icon-container').attr('data-current-pirate','true');

});

Template.JDPiratesInfo.helpers({
    otherPirates : function () {
        return Pirates.find({
            tableId: this.tableId,
            _id: {$ne: this._id}
        });
    }
});

Template.JDPirateInfo.events({
    'dblclick .jd-icon-container[data-current-pirate="true"][data-jdcoin-type="gold"]': function (e) {
        e.preventDefault();
        console.log('put gold on table');
    },
    'dblclick .jd-icon-container[data-current-pirate="true"][data-jdcoin-type="bat"]': function (e) {
        e.preventDefault();
        showSelectCompetitorModal({
            type: 'bat',
            currentPirate: this //stores current pirate doc
        });
    },
    'dblclick .jd-icon-container[data-current-pirate="true"][data-jdcoin-type="bet"]': function (e) {
        e.preventDefault();
        showSelectCompetitorModal({
            type: 'bet',
            currentPirate: this //stores current pirate doc
        });
    }
});

function showSelectCompetitorModal (context) {
    var template = Template.JDSelectPirateForCompetition;
    var parent = document.body;

    var view = context ?
        Blaze.renderWithData(template, context, parent)
        : Blaze.render(template,parent);
    //register event handlers on modal show/hide
    var modalId = '#jdSelectPirateForCompetition';
    $(modalId).on('hidden.bs.modal', function(){
        Blaze.remove(view);
    });

    $(modalId).modal('show');
};