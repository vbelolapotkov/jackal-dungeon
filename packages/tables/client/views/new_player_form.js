/**
 * Created by vbelolapotkov on 24/04/15.
 */
Template.GameTablesNewPlayerForm.onCreated(function () {
    this.gameTable = new GameTable(this.data._id);
});

Template.GameTablesNewPlayerForm.events({
    'submit #newPlayerForm': function (e) {
        e.preventDefault();
        //todo: add empty player name validation
        var nickname = e.target.elements['playerName'].value;
        var pass = e.target.elements['playerPass'].value;
        var gameTable = Template.instance().gameTable;
        if(nickname !== '')
            gameTable.addPlayer({nickname: nickname, pass: pass}, function (res) {
                //todo: route to table page when ready
                if (res)
                    console.log(res);
            });
        var modalId = '#addPlayerTo-'+this._id;
        $(modalId).modal('hide');
    },
    'keyup #playerNameInput': function (e) {
        var name = e.target.value;
        if(_.contains(this.players,name)) setPlayerNameWarning(e.target);
        else clearPlayerNameWarning(e.target);
    }
});

function setPlayerNameWarning (elem) {
    //prepare modifications
    var parent = elem.parentElement;
    if(parent.classList.contains('has-warning')) return;

    var feedback = document.createElement('span');
    feedback.className = "glyphicon glyphicon-warning-sign form-control-feedback";

    var msg = "Игрок с таким именем уже есть за столом";
    var helpBlock = document.createElement('span');
    helpBlock.className = "help-block";
    helpBlock.innerText = msg;

    //apply
    parent.appendChild(feedback);
    parent.appendChild(helpBlock);
    parent.classList.add("has-warning");
}

function clearPlayerNameWarning (elem) {
    var parent = elem.parentElement
    var glyphicon;
    var helpBlock;
    if(parent.classList.contains("has-warning")) {
        glyphicon = parent.getElementsByClassName('glyphicon-warning-sign');
        if(glyphicon.length > 0 ) parent.removeChild(glyphicon[0]);
        parent.classList.remove("has-warning");

        helpBlock = parent.lastElementChild;
        if(helpBlock.tagName === 'SPAN') parent.removeChild(helpBlock);
    }
}