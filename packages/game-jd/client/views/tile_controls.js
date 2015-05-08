/**
 * Created by vbelolapotkov on 07/05/15.
 */
Template.JDTileControls.onRendered(function () {
    var tile = this.data;
    var self = this;
    self.controlsContainer = this.$('#jdTileControls');
    self.positionControls = position.bind(self);
    self.positionControls(tile);
    tile.on('moving', function () {
        //this = tile object
        self.positionControls(this);
    });

});

Template.JDTileControls.events({
    'click button[name="rotateLeft"]': function (e) {
        animateRotation(e.currentTarget, this,'+=90');
    },
    'click button[name="rotateRight"]': function (e) {
        animateRotation(e.currentTarget, this, '-=90');
    },
    'click button[name="appendToMap"]': function (e) {
        var tile = this;
        tile.fire('modified', {action:'appendToMap'});
    },
    'click button[name="returnToDeck"]': function (e) {
        var tile = this;
        tile.fire('modified', {action: 'returnToDeck'});
    }
});

function position (tile) {
    //this - template instance
    var self = this;
    var tileLeft = tile.getLeft() - tile.getWidth()/2;
    var tileBottom = tile.getTop()+tile.getHeight()/2;

    self.controlsContainer.parent().css({position: 'relative'});
    self.controlsContainer.css({top: tileBottom+5, left: tileLeft});
}

function animateRotation (button, tile, angle) {
    button.disabled='disabled';
    tile.animate({
        'angle': angle
    }, {
        onChange: tile.canvas.renderAll.bind(tile.canvas),
        onComplete: function () {
            button.disabled=null;
            tile.fire('modified',{action:'rotate'});
        }
    });
}

