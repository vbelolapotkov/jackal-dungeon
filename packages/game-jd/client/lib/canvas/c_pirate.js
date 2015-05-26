cPirate = fabric.util.createClass(fabric.Circle, {
    type: 'cPirate',

    initialize: function (options) {
        options.radius = 15;
        options.hasControls = false;
        options.borderColor = '#0d0';
        options.originX = 'center';
        options.originY = 'center';
        this.callSuper('initialize', options);
    }
});