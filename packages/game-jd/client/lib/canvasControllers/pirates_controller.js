/**
 * Created by vbelolapotkov on 26/05/15.
 */
cPiratesController = function (canvas) {
    this.canvas = canvas;
    this.mapController = new cMapController(canvas);
    this.CTYPE = 'cPirate';
}

cPiratesController.prototype.addNewPirate = function (color) {
    //create new pirate and put it at the entrance
    var coords = this.mapController.getEntranceCoords();
    var pirate = new cPirate({
        fill: color,
        left: coords.left,
        top: coords.top,
        dX: 0,
        dY: 0
    });
    this.canvas.add(pirate);
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