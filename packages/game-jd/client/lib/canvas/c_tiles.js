//Tile object represents unit used to build a map
cTile = fabric.util.createClass(fabric.Image, {
    type: 'cTile',

    initialize: function (options, element) {
        //element is optional
        //method creates img from options.url if element is not passed
        if(!element) {
            element = document.createElement('img');
            element.src = options.url;
        }
        options || (options = {});
        options.width || (options.width = 100);
        options.height || (options.height = 100);
        options.stroke || (options.stroke = '#ddd');
        options.strokeWidth || (options.strokeWidth = 1);
        options.hoverCursor || (options.hoverCursor = 'pointer');
        options.borderColor || (options.borderColor = '#00f');
        options.hasControls || (options.hasControls = false);
        options.padding || (options.padding = 1);
        options.rx || (options.rx = 5);
        options.ry || (options.ry = 5);
        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');
        this.callSuper('initialize', element, options);
        this.set('tileId', options.id);
        this.on('selected', this.onTileSelect);
        this.on('mouseup', this.onMouseUp);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

cTile.prototype.onMouseUp = function (options) {
    //idea: use object center coords as reference instead of event coords
    var self = this;
    var coords = {
        left: Math.round(self.getLeft()/10)*10,
        top: Math.round(self.getTop()/10)*10
    };
    self.animate(coords, {
        duration: 100,
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            self.fire('modified', {action: 'move'});
        }
    });
};

cTile.prototype.onTileSelect = function () {
    this.bringToFront();
};

cTile.fromURL = function (options, callback) {
    //todo: replace fromURL method in the project
    //async method with image loading before tile creation
    fabric.util.loadImage(options.url, function (img) {
        callback && callback(new cTile(options, img))
    });
};

cTile.prototype.getId = function () {
    return this.id;
};

cTile.prototype.getCoords = function () {
    return {
        left: this.left,
        top: this.top
    }
};

cTile.prototype.getSize = function () {
    return {
        width: this.width,
        height: this.height
    }
};

cTile.prototype.setCoordsWithUpdate = function (coords) {
    this.set({
        left:coords.left,
        top: coords.top
    });
    this.setCoords();
};

cTile.prototype.setFreeStyle = function () {
    this.set({
        hasBorders: true,
        dX: udnefined,
        dY: undefined
    });
};

cTile.prototype.setMapStyle = function () {
    this.set({
        hasBorders: false
    });
}

cTile.prototype.setDungeonCoords = function(dCoords) {
    this.set({
        dX:dCoords.x,
        dY:dCoords.y
    });
}

cTile.prototype.getDungeonCoords = function () {
    return {
        x: this.dX,
        y: this.dY
    }
}

cTile.async = true;

EmptyTile = fabric.util.createClass(fabric.Rect, {
    type: "emptyTile",
    initialize: function (options) {
        options || (options = {});
        options.width || (options.width = 100);
        options.height || (options.height = 100);
        options.stroke || (options.stroke = '#ddd');
        options.strokeWidth || (options.strokeWidth = 2);
        options.fill || (options.fill = '#fff');
        options.hoverCursor || (options.hoverCursor = 'none');
        options.hasControls || (options.hasControls = false);
        options.hasBorders || (options.hasBorders = false);
        options.selectable  || (options.selectable = false);
        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');

        this.callSuper('initialize', options);
    }
});

EmptyTile.prototype.setDungeonCoords = function(dCoords) {
    this.set({
        dX:dCoords.x,
        dY:dCoords.y
    });
};

EmptyTile.prototype.highlight = function () {
    this.set({
        fill: '#999'
    });
};

EmptyTile.prototype.resetHighlight = function () {
    this.set({
        fill: '#fff'
    });
};