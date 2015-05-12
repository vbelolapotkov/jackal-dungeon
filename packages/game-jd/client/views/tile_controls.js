/**
 * Created by vbelolapotkov on 07/05/15.
 */
Template.JDTileControls.onRendered(function () {
    var self = this;
    var tile = this.data;
    self.tileController = new cTileController(tile.canvas);
    self.controlsContainer = this.$('#jdTileControls');
    self.positionControls = position.bind(self);
    self.positionControls(tile);
    var eventMap = [{
        name: 'moving',
        handler: function () {
            self.positionControls(this);
        }
    }];
    self.tileController.addEventHandlers(tile,eventMap);
});

Template.JDTileControls.events({
    'click button[name="rotateLeft"]': function (e) {
        animateRotation(e.currentTarget, Template.instance().tileController, this,'+=90');
    },
    'click button[name="rotateRight"]': function (e) {
        animateRotation(e.currentTarget, Template.instance().tileController, this, '-=90');
    },
    'click button[name="appendToMap"]': function (e) {
        var tile = this;
        Template.instance().tileController.fireEvent(tile, 'modified', {action:'appendToMap'});
    },
    'click button[name="returnToDeck"]': function (e) {
        var tile = this;
        Template.instance().tileController.fireEvent(tile, 'modified', {action: 'returnToDeck'});
    }
});

function position (tile) {
    //this - template instance
    var self = this;
    var coords = self.tileController.getCoords(tile);
    var size = self.tileController.getSize(tile);
    var tileLeft = coords.left - size.width/2;
    var tileBottom = coords.top+size.height/2;

    self.controlsContainer.parent().css({position: 'relative'});
    self.controlsContainer.css({top: tileBottom+5, left: tileLeft});
}

function animateRotation (button,tileController, tile, angle) {
    button.disabled='disabled';
    tileController.rotate(tile,angle, function (tile) {
        button.disabled=null;
        tileController.fireEvent(tile,'modified', {action: 'rotate'});
    });
}

