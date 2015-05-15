/**
 * Created by vbelolapotkov on 13/05/15.
 */
cMap = fabric.util.createClass(fabric.Group, {
    type: 'cMap',
    initialize: function (objects, options) {
        options || (options = {});
        options.hasControls || (options.hasControls = false);
        options.hasBorders || (options.hasBorders = false);
        options.padding || (options.padding = 2);

        options.originX || (options.originX = 'center');
        options.originY || (options.originY = 'center');
        this.callSuper('initialize', objects, options);
        this.on('mouseup', this.onMouseUp);
        this.on('object:dblclick', this.onDblClick);
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }

    //addWithUpdate: function (object) {
    //    //console.log('restoring object state');
    //    //this._restoreObjectsState();
    //    if (object) {
    //        this._objects.push(object);
    //        object.group = this;
    //    }
    //    // since _restoreObjectsState set objects inactive
    //    this.forEachObject(this._setObjectActive, this);
    //    this._calcBounds();
    //    this._updateObjectsCoords();
    //    return this;
    //}
});

cMap.prototype.onMouseUp = function (options) {
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

cMap.prototype.onDblClick = function (options) {
    console.log('dblclick');
    console.log(this);
    console.log(options);
};