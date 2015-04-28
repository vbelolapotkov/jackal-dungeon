/**
 * Created by vbelolapotkov on 24/04/15.
 */
Template.GameTablesNewPlayerForm.onCreated(function () {
    this.gameTable = new GameTable(this.data._id);
});

Template.GameTablesNewPlayerForm.events({
    'submit #newPlayerForm': function (e) {
        e.preventDefault();
        var nickname = e.target.elements['playerName'].value;
        var pass = e.target.elements['playerPass'].value;

        if(nickname !== '') {
            var modalId = '#addPlayerTo-'+this._id;
            var gameTable = Template.instance().gameTable;
            var passInput = e.target.elements['playerPass'];

            gameTable.addPlayer({nickname: nickname, pass: pass}, function (err) {
                if (err){
                    setFormElemState(passInput,'error', err.reason);
                }
                else {
                    $(modalId).data('auth', 'success');
                    $(modalId).modal('hide');
                }
            });
        }
        else {
            var nameInput = e.target.elements['playerName'];
            setFormElemState(nameInput, 'error', "Имя игрока не должно быть пустым");
        }
    },
    'keyup #playerNameInput': function (e) {
        var name = e.target.value;
        var gameTable = Template.instance().gameTable;
        if(gameTable.hasPlayer(name)) setFormElemState(e.target, 'warning', "Игрок с таким именем уже есть за столом");
        else {
            resetFormElemState(e.target);
            var passInput = document.getElementById('playerPassInput');
            resetPassInput(passInput);
        }

    },
    'keypress #playerPassInput': function (e) {
        resetPassInput(e.target);
    }
});


function resetFormElemState (elem, msg) {
    //[msg] - default helpBlock
    var parent = elem.parentElement;
    var glyphicon;
    if(hasState(elem)) {
        parent.classList.remove('has-error','has-warning','has-success');
        glyphicon = parent.getElementsByClassName('form-control-feedback');
        if(glyphicon.length > 0 ) parent.removeChild(glyphicon[0]);
    }

    //msg is not empty, set default block msg
    var helpBlock = parent.getElementsByClassName('help-block')[0];
    if (msg) {
        if (!helpBlock) {
            helpBlock = document.createElement('span');
            helpBlock.className = 'help-block';
            helpBlock = parent.appendChild(helpBlock);
        }
        helpBlock.innerText = msg;
    }
    else {
        if(helpBlock) parent.removeChild(helpBlock);
    }
}

function setFormElemState (elem, state, msg) {
    //reset previous state if required
    resetFormElemState(elem);

    var parent = elem.parentElement;
    var glyphicon;
    var stateClass;

    switch (state) {
        case 'error':
            glyphicon = "glyphicon glyphicon-remove form-control-feedback";
            stateClass = 'has-error';
            break;
        case 'warning':
            glyphicon = "glyphicon glyphicon-warning-sign form-control-feedback";
            stateClass = 'has-warning';
            break;
        case 'success':
            glyphicon = "glyphicon glyphicon-ok form-control-feedback";
            stateClass = 'has-success';
            break;
        default:
            //unknown state do nothing
            return;
    }

    if(!parent.classList.contains('has-feedback')) parent.classList.add('has-feedback');

    parent.classList.add(stateClass);

    var feedback = document.createElement('span');
    feedback.className = glyphicon;
    parent.appendChild(feedback);

    if(!msg) return;
    var helpBlock = document.createElement('span');
    helpBlock.className = "help-block";
    helpBlock.innerText = msg;
    parent.appendChild(helpBlock);
}

function hasState (elem) {
    var classes = elem.parentElement.classList;
    return classes.contains('has-warning') || classes.contains('has-error') || classes.contains('has-success');
}

function resetPassInput (elem) {
    if(hasState(elem))
        resetFormElemState(elem, 'Кодовое слово необходимо для последующих подключений к игре');
}
