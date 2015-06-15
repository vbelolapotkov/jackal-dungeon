/**
 * Created by vbelolapotkov on 10/06/15.
 */

Template.JDSelectPirateForCompetition.onCreated(function () {
    this.selectedPirateId = new ReactiveVar({_id:null});
    this.candidatesCursor = getCandidates(this.data.currentPirate, this.data.type);
});

Template.JDSelectPirateForCompetition.helpers({
    competitionHeader: function () {
        return buildCompetitionHeader(this.type);
    },
    candidates: function () {
        return Template.instance().candidatesCursor;
    },
    highlighted: function () {
        return (Template.instance().selectedPirateId.get()._id === this._id) ?
            'jd-highlight-yellow': '';
    },
    competitionAllowed: function () {
        // no conditions for bat competition
        if(this.type === 'bat') {
            return  this.currentPirate.batAMT > 0 &&
                    Template.instance().candidatesCursor.count() > 0;
        }
        if(this.type === 'bet') {
            return  this.currentPirate.betAMT > 0 &&
                    this.currentPirate.goldAMT > 0 &&
                    Template.instance().candidatesCursor.count() > 0;
        }
    },
    notAllowedReason: function () {
        if(this.type === 'bat' && this.currentPirate.batAMT < 1) {
            return 'Для испытания нужен хотя бы один жетон летучих мышей.';
        }

        if(this.type === 'bet' && this.currentPirate.betAMT < 1) {
            return 'Для испытания нужен хотя бы один жетон пари на золото.';
        }

        if(this.type === 'bet' && this.currentPirate.goldAMT < 1) {
            return 'Для пари на золото нужно иметь в кармане хотя бы одну монету.'
        }
        if(Template.instance().candidatesCursor.count() < 1){
            return 'Нет подходящих кандидатов для исыпытания.';
        }
    }
});

Template.JDSelectPirateForCompetition.events({
    'click .list-group-item': function () {
        //do nothing if clicked on header
        if(!this._id) return;

        Template.instance().selectedPirateId.set(this);
        var btn = document.getElementById('jdStartCompetitionBtn');
        if(btn) btn.disabled=false;
    },
    'click #jdStartCompetitionBtn': function () {
        //start competition
        var defender = Template.instance().selectedPirateId.get();
        if(!defender._id) return;
        var offender = this.currentPirate;
        var competitionOptions = {
            type: this.type,
            offenderId: offender._id,
            defenderId: defender._id
        };
        Meteor.call('JDBeginCompetition', competitionOptions, function (err) {
            if(err) console.error('JD Game: Failed to start new competition. '+err.reason);
        });
        $('#jdSelectPirateForCompetition').modal('hide');
    }
});

/*
* Builds competition header in html
* @param = competition type
* */
function buildCompetitionHeader(type) {
    if(type === 'bet') {
        return '<img class="jd-icon" src="/img/bet.png" alt="Bet icon"/> '+
            'Пари на золото';
    }
    else if(type === 'bat') {
        return '<img class="jd-icon" src="/img/bat.png" alt="Bat icon"/> '+
            'Летучие мыши';
    }
    else return '';
}

/*
* @return - {Collection cursor} candidates for competition of specified type
* */
function getCandidates(currentPirate, type) {
    var selector = {
        tableId: currentPirate.tableId,
        _id: {$ne: currentPirate._id}
    };
    if(type === 'bet') {
        //select pirates in the same tile with me who has gold
        selector['dCoords.x'] = currentPirate.dCoords.x;
        selector['dCoords.y'] = currentPirate.dCoords.y;
        selector.goldAMT = {$gt: 0};
    }
    return Pirates.find(selector, {sort: {goldAMT:'desc'}});
}