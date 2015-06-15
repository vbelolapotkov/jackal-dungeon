/**
 * Created by vbelolapotkov on 05/06/15.
 */
cGoldController = function (canvas) {
    this.canvas = canvas;
    this.mapController = new cMapController(canvas);
    this.CTYPE = 'cGold';
    this.IMG_URL = '/img/gold.png';
};

/*
* Puts gold on map at specified position
* @param - {Object} dCoords
* @param - {Function} callback. Function called with gold as a parameter when added to canvas.
* */
cGoldController.prototype.putGold = function(dCoords, callback) {
    //debugger;
    var eCoords = this.mapController.getEntranceCoords();
    var mCoords = this.mapController.coordsDungeon2Map(dCoords);
    var cCoords = JDGameController.rel2abs(mCoords, eCoords);
    var opts = {
        url: this.IMG_URL,
        left: cCoords.left,
        top: cCoords.top,
        relLeft: mCoords.left,
        relTop: mCoords.top,
        dX: dCoords.x,
        dY: dCoords.y
    };
    var canvas = this.canvas;
    cGold.fromURL(opts, function (gold) {
        canvas.add(gold);
        callback && callback(gold);
        canvas.renderAll();
    });
};

/*
* Removes gold at specified position
* @return - {Boolean} true if collect successfully
* @param - {Object} dCoords
* */

cGoldController.prototype.removeGold = function (dCoords) {
    var coin = this.findGoldAt(dCoords);
    if(!coin) return;
    coin.remove();
};

/*
 * Collect gold at specified coords
 * @return - {cGold} gold object at specified cords. Undefined if not found;
 * @param - {Object} dCoords
 * */
cGoldController.prototype.findGoldAt = function (dCoords) {
    var allCoins = this.findAllGold();
    return _.find(allCoins, function (coin) {
        var coinDcoords = coin.getDungeonCoords();
        return coinDcoords.x === dCoords.x && coinDcoords.y === dCoords.y;
    });
};

/*
* Return array of cGold object on map
* @return - {Array}
* */
cGoldController.prototype.findAllGold = function () {
    return this.canvas.getObjects(this.CTYPE);
};

/*
 * Returns gold if it was prev selected object.
 * @return - {cGold}
 * */
cGoldController.prototype.getSelected = function () {
    var prevSelected = this.canvas.getPrevActiveObject();
    if (!prevSelected || prevSelected.type !== this.CTYPE) return;
    return prevSelected;
};

