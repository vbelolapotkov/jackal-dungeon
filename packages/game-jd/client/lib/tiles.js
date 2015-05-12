//Tile object represents unit used to build a map
Tile = fabric.util.createClass(fabric.Image, {
    type: 'mapTile',

    initialize: function (element ,options) {
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
        //this.on('selected', this.onTileSelect);
        //this.on('mouseup', this.onMouseUp);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            tileId: this.get('tileId')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

Tile.prototype.onMouseUp = function (options) {
    //todo: fix to work with touch devices
    //idea: use object center coords as reference instead of event coords
    var self = this;
    var center = {
        x: Math.floor(self.getLeft() + self.getWidth()/2),
        y: Math.floor(self.getTop() + self.getHeight()/2)
    };
    var coords = {
        x: Math.floor(center.x/100)*100,
        y: Math.floor(center.y/100)*100
    };
    self.animate({
        left: coords.x,
        top: coords.y
    }, {
        onChange: self.canvas.renderAll.bind(self.canvas)
    });
};

Tile.prototype.onTileSelect = function (options) {
    this.bringToFront();
};

Tile.fromURL = function (options, callback) {
    fabric.util.loadImage(options.url, function (img) {
        callback && callback(new Tile(img, options))
    });
};

Tile.async = true;

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
        options.selectable  || (options.selectable = false);
        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');

        this.callSuper('initialize', options);
    }
});

Tile.findById = function (id, canvas) {
    if(!id || !canvas) return;
    var objects = canvas.getObjects('mapTile');
    if(!objects) return;
    var tile = _.find(objects, function (obj) {
        return obj.tileId === id;
    });

    return tile;
}