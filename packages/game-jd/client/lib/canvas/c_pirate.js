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
* @param - {Object} coords point coords to set
* @param - {Object} ref reference point for relative position
* */
cPirate.prototype.setRelPosition = function (coords, ref) {
    this.relLeft = coords.left - ref.left;
    this.relTop = coords.top - ref.top;
    this.currentRef = ref;
};

cPirate.prototype.getRelPosition = function () {
    return {
        left: this.relLeft || 0,
        top: this.relTop || 0
    }
};

cPirate.prototype.getCurrenReference = function () {
    return this.currentRef;
}

cPirate.prototype.getSize = function () {
    return {
        radius:this.radius
    }
};

function onSelected(options) {
    this.unselectOnClick = !options.e;
}

function onClick() {
    if(this.unselectOnClick)
        this.canvas.discardActiveObject();
    else this.unselectOnClick = true;
}