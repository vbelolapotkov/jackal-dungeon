/**
 * Created by vbelolapotkov on 14/05/15.
 */
CanvasExt = fabric.util.createClass(fabric.Canvas, {
    _bindEvents: function () {
        var self = this;

        self.callSuper('_bindEvents');
        self._onDoubleClick = self._onDoubleClick.bind(self);
    },

    _initEventListeners: function() {
        var self = this;
        self.callSuper('_initEventListeners');

        fabric.util.addListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
    },

    _onDoubleClick: function(e) {
        var self = this;

        var target = self.findTarget(e);
        self.fire('mouse:dblclick', {
            target: target,
            e: e
        });

        if (target && !self.isDrawingMode) {
            // To unify the behavior, the object's double click event does not fire on drawing mode.
            target.fire('object:dblclick', {
                e: e
            });
        }
    },
    removeListeners: function () {
        var self = this;
        self.callSuper('removeListeners');

        fabric.util.removeListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
    }
});