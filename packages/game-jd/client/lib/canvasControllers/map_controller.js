cMapController = function (options) {
    this.canvas = options.canvas;
    this.tileController =  new cTileController(this.canvas);
};

cMapController.prototype.createMap = function (tileOptions) {
    var self = this;
    var coords = {
        left: Math.round(self.canvas.getWidth()/20)*10,
        top: Math.round(self.canvas.getHeight()/20)*10
    };
    cTile.fromURL(tileOptions, function (tile) {
        self.setMapOptions(tile);
        self.setMapCoords(tile, {x:0,y:0});
        self.map = new cMap([tile],coords);
        self.canvas.add(self.map);
        self.addEmptyTiles([
            {x:1,y:0},
            {x:-1,y:0},
            {x:0,y:1},
            {x:0,y:-1}
        ]);
        self.selectEmptyTile({x:1,y:0});
        self.unselectEmptyTile({x:1,y:0});
    });
};

cMapController.prototype.getEntrance = function () {
    return this.map.item(0);
};

cMapController.prototype.getTileById = function (id) {
    var tile;
    this.map.forEachObject(function (mTile) {
        if(mTile.id === id) tile = mTile;
    });
    return tile;
};

cMapController.prototype.getTileAt = function (mCoords, type) {
    var self = this;
    var tiles = self.map.getObjects(type);
    var t = _.find(tiles, function (t) {
        return t.mX === mCoords.x && t.mY === mCoords.y;
    });
    return t;
};

cMapController.prototype.setMapOptions = function (tile) {
    this.tileController.set(tile, {
        hasBorders: false
    });
};

cMapController.prototype.setMapCoords  = function (tile, coords) {
    this.tileController.set(tile, {
        mX: coords.x,
        mY: coords.y
    });
};

cMapController.prototype.getMapCoords = function (tile) {
    return {x: tile.mX, y: tile.mY};
};

cMapController.prototype.coordsMap2Canvas = function (mCoords) {
    //convert tile coords in map to canvas
    if(!mCoords) mCoords = {left: 0, top: 0};
    var offsetX = this.map.getLeft();
    var offsetY = this.map.getTop();
    return {
        left: mCoords.left + offsetX,
        top: mCoords.top + offsetY
    };
};

cMapController.prototype.allignTile = function (tile, mCoords) {
    var t = this.getTileAt(mCoords);
    var tCoords = this.tileController.getCoords(t);
    tCoords = this.coordsMap2Canvas(tCoords);
    this.tileController.setCoordsWithUpdate(tile, tCoords);
};

cMapController.prototype.attachTile = function (tile, mCoords) {
    //tile - tile obj on canvas or tile options

    //var t = this.tileController.getTile(tile);

    this.tileController.remove(tile);
    this.setMapOptions(tile);
    this.allignTile(tile, mCoords);
    this.setMapCoords(tile, mCoords);
    this.map.addWithUpdate(tile);
    this.removeEmptyTile(mCoords);
    this.canvas.renderAll();
};

cMapController.prototype.detachTile = function (tile) {

};

cMapController.prototype.addEmptyTiles = function (coords) {
    //make array if only single object passed
    if(!coords.length) coords = [coords];
    else if(coords.length === 0) return;

    var self = this;
    var entrance = self.getEntrance();
    var eCoords = self.tileController.getCoords(entrance);
    eCoords = self.coordsMap2Canvas(eCoords);
    //var mCoords = {
    //    left: self.map.getLeft(),
    //    top: self.map.getTop()
    //};

    _.each(coords, function (mapCoords) {
        var tCoords = {
            left: Math.round(eCoords.left + mapCoords.x*100),
            //left: Math.round(mCoords.left + mapCoords.x*100),
            //top: Math.round(mCoords.top + mapCoords.y*100)
            top: Math.round(eCoords.top + mapCoords.y*100)
        };
        var t = new EmptyTile(tCoords);
        self.setMapCoords(t, mapCoords);
        self.map.addWithUpdate(t);
    });
    self.map.sendToBack();
    self.canvas.renderAll();
};

cMapController.prototype.removeEmptyTile = function (mCoords) {
    var t = this.getTileAt(mCoords, 'emptyTile');
    if(!t) return;
    this.map.remove(t);
    this.canvas.renderAll();
};

cMapController.prototype.selectEmptyTile = function (mCoords) {
    var t = this.getTileAt(mCoords, 'emptyTile');
    if(!t) return;
    this.tileController.set(t, {
        fill: '#999'
    });
    this.canvas.renderAll();
};

cMapController.prototype.unselectEmptyTile = function (mCoords) {
    var t = this.getTileAt(mCoords, 'emptyTile');
    if(!t) return;
    this.tileController.set(t, {
        fill: '#fff'
    });
    this.canvas.renderAll();
};

cMapController.prototype.findMapCoords = function (tile) {
    //look for the empty tile under the center of tile to be attached
    var self = this;
    var tileCenter = self.tileController.getCenterPoint(tile);
    var candidates = self.map.getObjects('emptyTile');
    var target = _.find(candidates, function (c) {
        var coords = self.tileController.getCoords(c);
        coords = self.coordsMap2Canvas(coords);
        var dim = self.tileController.getSize(c);
        var rect = {
            left: coords.left,
            top: coords.top,
            width: dim.width,
            height: dim.height
        };
        return contains(rect, tileCenter);
    });
    if(!target) return;
    return self.getMapCoords(target);
};

cMapController.prototype.hasTileAt = function (mCoords) {
    //checks if there is a tile on map at specified coordinates
    return this.getTileAt(mCoords) ? true : false;
};

cMapController.prototype.getTileId = function (tile) {
    return this.tileController.getId(tile);
}

function contains(rect, point) {
    //checks if rectangle defined by left,top,width,height contains point
    if(point.left < rect.left || point.left > rect.left+rect.width) return false;
    return !(point.top < rect.top || point.top > rect.top + rect.height);

}