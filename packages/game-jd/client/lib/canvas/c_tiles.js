//Tile object represents unit used to build a map
cTile = fabric.util.createClass(fabric.Image, {
    type: 'cTile',

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
        this.on('mouseup', this.onMouseUp);
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

cTile.prototype.onMouseUp = function (options) {
    //idea: use object center coords as reference instead of event coords
    var self = this;
    var coords = {
        left: Math.round(self.getLeft()/10)*10,
        top: Math.round(self.getTop()/10)*10
    };
    self.animate(coords, {
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            self.fire('modified', {action: 'move'});
        }
    });
};

cTile.prototype.onTileSelect = function (options) {
    this.bringToFront();
};

cTile.fromURL = function (options, callback) {
    fabric.util.loadImage(options.url, function (img) {
        callback && callback(new cTile(img, options))
    });
};

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
        options.selectable  || (options.selectable = false);
        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');

        this.callSuper('initialize', options);
    }
});