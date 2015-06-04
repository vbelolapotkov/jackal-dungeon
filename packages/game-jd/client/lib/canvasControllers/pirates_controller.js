/**
 * Created by vbelolapotkov on 26/05/15.
 */
cPiratesController = function (canvas) {
    this.canvas = canvas;
    this.mapController = new cMapController(canvas);
    this.CTYPE = 'cPirate';
}

/*
* Creates new pirate with specified options and adds to canvas
* @param - {Object} options of new pirate
* */
cPiratesController.prototype.addNewPirate = function (options) {
    var eCoords = this.mapController.getEntranceCoords();
    var mCoords = options.mCoords || this.setInitialCoords();
    var cCoords = JDGameController.rel2abs(mCoords, eCoords);
    var pirate = new cPirate({
        fill: options.color,
        left: cCoords.left,
        top: cCoords.top,
        dX: options.dCoords.x,
        dY: options.dCoords.y
    });
    this.canvas.add(pirate);
};

/*
* Generates default map coords for new pirates
* @return - {Object} left; top coordinates in map system;
* */
cPiratesController.prototype.setInitialCoords = function () {
    var pirates = this.findPiratesAt({x:0,y:0});
    var fixedPoints = [
        {x:1,y:-1},
        {x:1,y:1},
        {x:-1,y:1},
        {x:-1,y:-1},
        {x:3,y:-1},
        {x:3,y:1},
        {x:1,y:3},
        {x:-1,y:3},
        {x:-3,y:1},
        {x:-3,y:-1},
        {x:-1,y:-3},
        {x:1,y:3}];
    var r = cPirate.getDefaultRadius();
    var point = fixedPoints[(pirates.length % fixedPoints.length)];
    return {
        left: point.x*r,
        top: point.y*r
    };
};

/*
* @return - array of cPirate objects, which pass test predicate. Return all if no test passed
* @param - {function} test - test function.
* */
cPiratesController.prototype.findPirates = function (test) {
    var all = this.canvas.getObjects(this.CTYPE);
    if(!test) return all;
    return all.filter(test);
};

cPiratesController.prototype.findPiratesAt = function (dCoords) {
    return this.findPirates(function (p) {
        var piratePosition = p.getDungeonCoords();
        return piratePosition.x === dCoords.x && piratePosition.y === dCoords.y;
    });
};

/*
 * Returns pirate if it was prev selected object.
 * @return - {cPirate}
 * */
cPiratesController.prototype.getSelected = function(){
    var prevSelected = this.canvas.getPrevActiveObject();
    if (!prevSelected || prevSelected.type !== this.CTYPE) return;
    return prevSelected;
};

/*
* Sets pirate in the active state
* @param - {cPirate} pirate Pirate object
* */
cPiratesController.prototype.setSelected = function (pirate) {
    this.canvas.setActiveObject(pirate);
};

/*
* Animates one step to next tile
* @param - {cPirate} pirate object to move
* @param - {Object} cCoords canvas coords of pirate new position
* */
cPiratesController.prototype.step = function (pirate, cCoords) {
    var self = this;
    pirate.animate(cCoords,  {
        onChange: self.canvas.renderAll.bind(self.canvas)
    });
};

/*
* Animates pirate moving through hidden door
* @param - {cPirate} pirate object to move
* @param - {Object} cCoords canvas coords of pirate new position
* */
cPiratesController.prototype.reappear = function (pirate, cCoords) {
    var canvas = this.canvas;
    var oldCCoords =  pirate.getPosition();
    var originalSize = pirate.getSize();
    pirate.animate('radius', 0.1, {
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function () {
            pirate.setPosition(cCoords);
            pirate.animate('radius',originalSize.radius,{
                onChange: canvas.renderAll.bind(canvas),
                duration: 350
            });
        },
        duration: 350
    });
};