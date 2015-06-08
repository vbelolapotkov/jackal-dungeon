/**
 * Created by vbelolapotkov on 05/06/15.
 */
cGold = fabric.util.createClass(fabric.Image, {
    type: 'cGold',

    initialize: function (options, element) {
        if(!element) {
            element = document.createElement('img');
            element.src = options.url;
        }
        options || (options = {});
        options.width || (options.width = 40);
        options.height || (options.height = 40);
        options.strokeWidth || (options.strokeWidth = 1);
        options.hoverCursor || (options.hoverCursor = 'pointer');
        options.borderColor || (options.borderColor = '#ff0');
        options.hasControls || (options.hasControls = false);
        options.lockMovementX = true;
        options.lockMovementY = true;
        options.padding || (options.padding = 1);
        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');
        this.callSuper('initialize', element, options);
    },

    remove: function () {
        //remove all event listeners on coin remove
        this.off();
        this.callSuper('remove');
    }
});

cGold.fromURL = function (options, callback) {
    fabric.util.loadImage(options.url, function (img) {
        callback && callback(new cGold(options, img))
    });
};

cGold.async = true;

cGold.prototype.getDungeonCoords = function () {
    return {
        x: this.dX,
        y: this.dY
    }
};

cGold.prototype.setDungeonCoords = function (dCoords) {
    this.set({
        dX: dCoords.x || 0,
        dY: dCoords.y || 0
    });
};

cGold.prototype.getPosition = function () {
    return {
        left: this.left,
        top: this.top
    }
};

cGold.prototype.setPosition = function (cCoords) {
    this.set({
        left: cCoords.left,
        top: cCoords.top
    });
    this.setCoords();
};

/*
 * Updates relative position properties with reference to some point
 * @param - {Object} relCoords relative coords
 * */
cGold.prototype.setRelPosition = function (relCoords) {
    this.relLeft = relCoords.left;
    this.relTop = relCoords.top;
};

cGold.prototype.getRelPosition = function () {
    return {
        left: this.relLeft || 0,
        top: this.relTop || 0
    }
};