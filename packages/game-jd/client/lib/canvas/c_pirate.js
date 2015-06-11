cPirate = fabric.util.createClass(fabric.Circle, {
    type: 'cPirate',

    initialize: function (options) {
        options.radius = 12.5;
        options.hasControls = false;
        options.borderColor = '#0d0';
        options.originX = 'center';
        options.originY = 'center';
        options.lockMovementX = true;
        options.lockMovementY = true;
        this.callSuper('initialize', options);
        this.on('selected', onSelected.bind(this));
        this.on('object:click', onClick.bind(this));
    }
});

cPirate.getDefaultRadius = function () {
    return 12.5;
};

cPirate.prototype.getId = function () {
    return this.id
};

cPirate.prototype.getDungeonCoords = function () {
    return {
        x: this.dX,
        y: this.dY
    }
};

cPirate.prototype.setDungeonCoords = function (dCoords) {
    this.set({
        dX: dCoords.x || 0,
        dY: dCoords.y || 0
    });
};

cPirate.prototype.getPosition = function () {
    return {
        left: this.left,
        top: this.top
    }
};

cPirate.prototype.setPosition = function (cCoords) {
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
cPirate.prototype.setRelPosition = function (relCoords) {
    this.relLeft = relCoords.left;
    this.relTop = relCoords.top;
};

cPirate.prototype.getRelPosition = function () {
    return {
        left: this.relLeft || 0,
        top: this.relTop || 0
    }
};

cPirate.prototype.getSize = function () {
    return {
        radius:this.radius
    }
};

function onSelected(options) {
    this.bringToFront();
    this.unselectOnClick = !options.e;
};

function onClick() {
    if(this.unselectOnClick)
        this.canvas.discardActiveObject();
    else this.unselectOnClick = true;
};