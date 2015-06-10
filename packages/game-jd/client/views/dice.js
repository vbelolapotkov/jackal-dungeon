/**
 * Created by vbelolapotkov on 08/06/15.
 */
Template.JDDice.onRendered(function () {
    var single = document.getElementById('jdSingleDice');
    var dual = document.getElementById('jdDoubleDice');
    //single.style.backgroundImage = "url('/img/dice_1.png')";
    //dual.style.backgroundImage = "url('/img/dice_2.png')";
});

Template.JDDice.helpers({
    diceResults: function () {
        return Dice.find({
            tableId: this.tableId,
            competition: false
        });
    }
});

Template.JDDice.events({
   'click #jdSingleDice': function (e) {
       var opts = {
           dual: false
       };
       Meteor.call('JDDiceRoll', opts, function (err, result) {
           if(err)
            console.error('JD Dice Error: '+err.reason);
       });
   },
    'click #jdDoubleDice': function (e) {
        var opts = {
            dual: true
        };
        Meteor.call('JDDiceRoll', opts, function (err, result) {
            if(err)
                console.error('JD Dice Error: '+err.reason);
        });
    }
});

Template.JDDiceResult.helpers({
    diceAMT: function () {
        return this.d2 ? 'alert-danger' : 'alert-success'
    },
    formattedName: function () {
        return hasShortName(this.ownerName) ? this.ownerName : shortName(this.ownerName)
    }
});

Template.JDDiceResult.onRendered(function () {
    if(!hasShortName(this.data.ownerName))
        this.$('[data-toggle="tooltip"]').tooltip({
            delay: {
                show: 500,
                hide: 100
            }
        });
});

Template.JDDiceResult.events({
    'click .close': function () {
        var tooltip = Template.instance().$('[data-toggle="tooltip"]').tooltip('destroy');
        if(tooltip)tooltip.remove();
        Dice.remove(this._id);
    }
});

function hasShortName (name){
    return name.length < 10;
}

function shortName (string) {
    return string.slice(0,7)+'...';
}