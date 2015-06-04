/**
 * Created by vbelolapotkov on 14/05/15.
 */
CanvasExt = fabric.util.createClass(fabric.Canvas, {
    tapholdThreshold: 2000,

    initialize: function (el, options) {
        this.callSuper('initialize',el, options);
        this._prevActiveObject = null;
    },
    
    _discardActiveObject: function () {
        this._prevActiveObject = this._activeObject;
        this.callSuper('_discardActiveObject');
    },
    
    _bindEvents: function () {
        var self = this;

        self.callSuper('_bindEvents');
        self._onClick = self._onClick.bind(self);
        self._onDoubleClick = self._onDoubleClick.bind(self);
        self._onTapHold = self._onTapHold.bind(self);
    },

    _initEventListeners: function() {
        var self = this;
        self.callSuper('_initEventListeners');

        fabric.util.addListener(self.upperCanvasEl, 'click', self._onClick);
        fabric.util.addListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
    },
    _onClick: function (e) {
        var self = this;
        if(e.which === 3) e.preventDefault();
        var target = self.findTarget(e);
        if(target && !self.isDrawingMode) {
            target.fire('object:click', {
                target: target,
                e: e
            });
        }
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
    _onTapHold: function (e) {
        var self = this;

        var target = self.findTarget(e);
        self.fire('touch:taphold', {
            target: target,
            e: e
        });

        if (target && !self.isDrawingMode) {
            // To unify the behavior, the object's tap hold event does not fire on drawing mode.
            target.fire('taphold', {
                e: e
            });
        }

        if (e.type === 'touchend' && self.touchStartTimer != null) {
            clearTimeout(self.touchStartTimer);
        }
    },
    _onMouseDown: function (e) {
        var self = this;

        self.callSuper('_onMouseDown', e);

        if (e.type === 'touchstart') {
            var touchStartTimer = setTimeout(function () {
                self._onTapHold(e);
                self.isLongTap = true;
            }, self.tapholdThreshold);

            self.touchStartTimer = touchStartTimer;

            return;
        }

        // Add right click support
        if (e.which === 3) {
            var target = this.findTarget(e);
            self.fire('mouse:down', { target: target, e: e });
            if (target && !self.isDrawingMode) {
                // To unify the behavior, the object's mouse down event does not fire on drawing mode.
                target.fire('mousedown', {
                    e: e
                });
            }
        }
    },

    _onMouseUp: function (e) {
        var self = this;

        self.callSuper('_onMouseUp', e);

        if (e.type === 'touchend') {
            // Process tap hold.
            if (self.touchStartTimer != null) {
                clearTimeout(self.touchStartTimer);
            }

            // Process long tap.
            if (self.isLongTap) {
                self._onLongTapEnd(e);
                self.isLongTap = false;
            }

            // Process double click
            var now = new Date().getTime();
            var lastTouch = self.lastTouch || now + 1;
            var delta = now - lastTouch;
            if (delta < 300 && delta > 0) {
                // After we detct a doubletap, start over
                self.lastTouch = null;

                self._onDoubleTap(e);
            } else {
                self.lastTouch = now;
            }

            return;
        }
    },
    _onDoubleTap: function (e) {
        var self = this;

        var target = self.findTarget(e);
        self.fire('touch:doubletap', {
            target: target,
            e: e
        });

        if (target && !self.isDrawingMode) {
            // To unify the behavior, the object's double tap event does not fire on drawing mode.
            target.fire('object:doubletap', {
                e: e
            });
        }
    },

    _onLongTapEnd: function (e) {
        var self = this;

        var target = self.findTarget(e);
        self.fire('touch:longtapend', {
            target: target,
            e: e
        });

        if (target && !self.isDrawingMode) {
            // To unify the behavior, the object's long tap end event does not fire on drawing mode.
            target.fire('object:longtapend', {
                e: e
            });
        }
    },

    removeListeners: function () {
        var self = this;
        self.callSuper('removeListeners');

        fabric.util.removeListener(self.upperCanvasEl, 'click', self._onClick);
        fabric.util.removeListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
    }
});

CanvasExt.prototype.getPrevActiveObject = function () {
    return this._prevActiveObject;
};