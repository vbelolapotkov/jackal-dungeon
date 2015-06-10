/**
 * Created by vbelolapotkov on 10/06/15.
 */
Template.JDCompetition.onRendered(function () {
    //disable dice button if not participating in competition
    this.currentPirate = Template.parentData(1);
    if(this.currentPirate._id !== this.data.offenderId && this.currentPirate._id !== this.data.defenderId) {
        this.$('#jdCompetitionDice').attr('disabled', 'disabled');
    }

    //set dice observers
    var offenderDiceRolls = Dice.find({
        competition: true,
        competitionId: this.data._id,
        ownerId: this.data.offenderId
    });

    var instance = this;
    this.offenderObserver = offenderDiceRolls.observe({
        added: function (doc) {
            var selector = 'tr[data-jdcomp-round="'+doc.competitionRound+'"] > '+
                    'td[data-jdcomp="offender"]';
            instance.$(selector).html('<strong>'+doc.d1+'</strong>');
        }
    });
    var defenderDiceRolls = Dice.find({
        competition: true,
        competitionId: this.data._id,
        ownerId: this.data.defenderId
    });
    this.defenderObserver = defenderDiceRolls.observe({
        added: function (doc) {
            var selector = 'tr[data-jdcomp-round="'+doc.competitionRound+'"] > '+
                'td[data-jdcomp="defender"]';
            instance.$(selector).html('<strong>'+doc.d1+'</strong>');
        }
    });

});

function stopObservers() {
    this.offenderObserver && this.offenderObserver.stop();
    this.defenderObserver && this.defenderObserver.stop();
}

Template.JDCompetition.onDestroyed(function () {
    //stop dice observers
    stopObservers.call(this);
});

Template.JDCompetition.helpers({
    competitionHeader: function () {
        return buildCompetitionHeader(this.competitionType);
    },
    diceStyle: function () {
        if (this.competitionType === 'bet') return 'btn-primary';
        if (this.competitionType === 'bat') return 'btn-danger';
    }

});

Template.JDCompetition.events({
    'click #jdCompetitionDice': function () {
        var opts = {
            dual: false,
            competition: true,
            competitionId: this._id
        };
        Meteor.call('JDDiceRoll', opts, function (err, result) {
            if(err)
                console.error('JD Dice Error: '+err.reason);
        });
    },
    'click #jdCompetitionEnd': function () {
        stopObservers.call(Template.instance());
        Meteor.call('JDEndCompetition', this._id, function (err) {
            if(err)
                console.error('JD Competition Error: '+err.reason);
        });
    }
});

/*
 * Builds competition header in html
 * @param = competition type
 * */
function buildCompetitionHeader(type) {
    if(type === 'bet') {
        return '<img class="jd-icon" src="/img/bet.jpg" alt="Bet icon"/> '+
            'Пари на золото';
    }
    else if(type === 'bat') {
        return '<img class="jd-icon" src="/img/bat.jpg" alt="Bat icon"/> '+
            'Летучие мыши';
    }
    else return '';
}