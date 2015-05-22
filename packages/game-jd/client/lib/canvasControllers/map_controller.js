cMapController = function (options) {
    this.canvas = options.canvas;
    this.tileController =  new cTileController(this.canvas);
};

/*
* adds map to canvas
* @tiles - array of tile options to create new tiles
* @callback - callback function with one bool parameter - the result of map creation
* */
cMapController.prototype.createMap = function (tiles, callback) {
    var self = this;
    var coords = {
        left: Math.round(self.canvas.getWidth()/20)*10,
        top: Math.round(self.canvas.getHeight()/20)*10
    };
    //entrance tile should be first in the array
    if(tiles[0].type !== 'entrance') {
        callback(false);
        return;
    }

    cTile.fromURL({
        url: tiles[0].url,
        id: tiles[0].id
    }, function (entrance) {
        self.setMapStyle(entrance);
        self.setDungeonCoords(entrance, {x:0, y:0});
        self.map = new cMap([entrance],coords);
        self.canvas.add(self.map);
        self.addEmptyTiles([
            {x: 1, y: 0},
            {x:-1, y: 0},
            {x: 0, y: 1},
            {x: 0, y:-1},
        ]);
        self.canvas.renderAll();
        _.each(tiles.slice(1), function (t) {
            self.attachTile(t, t.dCoords);
        });

        self.map.on('object:dblclick', handleMapDblClick.bind(self));
        callback(true);
    });
};

/*
 * @return - id value of a tile object
 * */
cMapController.prototype.getTileId = function (tile) {
    return this.tileController.getId(tile);
};

/*
 * @return - map tile with specified id
 * @id - tile id from DB
 * */
cMapController.prototype.getTileById = function (id) {
    var tile;
    this.map.forEachObject(function (mTile) {
        if(mTile.id === id) tile = mTile;
    });
    return tile;
};

/*
* @return - map entrance tile
* */
cMapController.prototype.getEntrance = function () {
    return this.map.item(0);
};

/*
* @return - map entrance tile relative to canvas object
* */
cMapController.prototype.getEntranceCoords = function () {
    var e = this.getEntrance();
    var eCoords = this.tileController.getCoords(e);
    return this.coordsMap2Canvas(eCoords);
};

/*
* @return - return tile of specified type with specific dCoords
* @dCoords - {x,y} tile coords on dungeon map with reference to entrance tile {x:0,y:0}
* @type - (optional) type of tile: emptyTile or cTile. If not defined search for any type
* */
cMapController.prototype.getTileAt = function (dCoords, type) {
    var self = this;
    var tiles = self.map.getObjects(type);
    var t = _.find(tiles, function (t) {
        return t.dX === dCoords.x && t.dY === dCoords.y;
    });
    return t;
};

/*
 * checks if there is a tile at dCoords
 * @return - boolean
 * @type - (optional) type of the tile to check
 * */
cMapController.prototype.hasTileAt = function (dCoords, type) {
    //checks if there is a tile on map at specified coordinates
    return this.getTileAt(dCoords, type) ? true : false;
};
/*
 * checks if there is a mapTile at dCoords
 * @return - boolean
 * */
cMapController.prototype.hasMapTileAt = function (dCoords) {
    return this.hasTileAt(dCoords, 'cTile');
};

/*
* assign tile specific styling options before attaching to map
* */
cMapController.prototype.setMapStyle = function (tile) {
    this.tileController.set(tile, {
        hasBorders: false
    });
};

/*
* assign tile coords (x,y) to tile object
* */
cMapController.prototype.setDungeonCoords  = function (tile, dCoords) {
    this.tileController.set(tile, {
        dX: dCoords.x,
        dY: dCoords.y
    });
};

/*
 * @return - tile coords stored on tile object
 * */
 cMapController.prototype.getDungeonCoords = function (tile) {
    return {x: tile.dX, y: tile.dY};
};

/*
* converts coords in map object to coords on canvas taking into account map object offset on canvas
* @mCoords - {left, top} - pixel coords in map coordinate system
* */
cMapController.prototype.coordsMap2Canvas = function (mCoords) {
    //applies map offset in canvas to map object
    if(!mCoords) mCoords = {left: 0, top: 0};

    var offsetX = this.map.getLeft();
    var offsetY = this.map.getTop();
    return {
        left: mCoords.left + offsetX,
        top: mCoords.top + offsetY
    };
};

/*
 * converts coords in canvas object to coords on map taking into account map object offset on canvas
 * @return - {left, top} - pixel coords in map coordinate system
 * @cCoords - {left, top} - pixel coords in canvas coordinate system
 * */
cMapController.prototype.coordsCanvas2Map = function (cCoords) {
    //applies map offset in canvas to map object
    if(!cCoords) cCoords = {left: 0, top: 0};

    var offsetX = this.map.getLeft();
    var offsetY = this.map.getTop();
    return {
        left: cCoords.left - offsetX,
        top: cCoords.top - offsetY
    };
};

/*
* sets tile coordinates equal to map tile with dCoords;
* @tile - tile which coordinates are modified
* @dCoords - {x,y} tile coordinates on map with ref to entrance
* */
cMapController.prototype.allignTile = function (tile, dCoords) {
    var t = this.getTileAt(dCoords);
    var mCoords = this.tileController.getCoords(t); //{left, top} with ref to map
    var cCoords = this.coordsMap2Canvas(mCoords); //{left, top} with ref to canvas
    this.tileController.setCoordsWithUpdate(tile, cCoords);
};

/*
*attache tile to map at specified coords {x,y}
* @tile - tile to be attached
* @
* */
cMapController.prototype.attachTile = function (tile, dCoords) {
    //tile - tile obj on canvas or tile options
    var self = this;

    //local func to replace common sequence of actions on attach
    var updateCanvasOnAttach = function (t, mC) {
        self.map.addWithUpdate(t);
        self.removeEmptyTile(mC);
        self.addEmptyTiles(self.getEmptyNeighbors(mC));
        self.map.setCoords();
        self.canvas.renderAll();
    };

    if(!self.tileController.isTile(tile)) {
        //tile - tile options
        var entrance = self.getEntrance();
        var eCCoords = self.coordsMap2Canvas(self.tileController.getCoords(entrance));
        var cCoords = {
            left: Math.round(eCCoords.left + dCoords.x*100),
            top: Math.round(eCCoords.top + dCoords.y*100)
        };
        /*
        * using async constructor here because with sync empty tile shown
        * on iPad when tile attached to map by other player
        * */
        cTile.fromURL({
                url: tile.url,
                id: tile.id,
                left: cCoords.left,
                top: cCoords.top
            }, function (tObj) {
                self.setMapStyle(tObj);
                self.setDungeonCoords(tObj, dCoords);
                updateCanvasOnAttach(tObj, dCoords);
        });
    } else {
        if(self.hasTileAt(dCoords, 'cTile')) {
            return;
        }
        self.tileController.remove(tile);
        self.allignTile(tile, dCoords);
        self.setMapStyle(tile);
        self.setDungeonCoords(tile, dCoords);
        updateCanvasOnAttach(tile, dCoords);
    }
};

cMapController.prototype.detachTile = function (tile) {

};

/*
* @return - array of dCoords {x,y} without any tiles
* @dCoords - coordinates of center
* */
cMapController.prototype.getEmptyNeighbors = function (dCoords) {
    var candidates = [
        {x: dCoords.x + 1, y: dCoords.y},
        {x: dCoords.x - 1, y: dCoords.y},
        {x: dCoords.x    , y: dCoords.y + 1},
        {x: dCoords.x    , y: dCoords.y - 1},
    ];
    var result = [];
    var self = this;
    _.each(candidates, function (c) {
        if(!self.hasTileAt(c))
            result.push(c);
    });
    return result;
};

/*
* adds empty tiles at dCoords {x,y}
* @dCoords - array or single tCoord object
* */
cMapController.prototype.addEmptyTiles = function (dCoords) {
    //quit if array is empty
    if(dCoords.length === 0) return;
    //make array if only single object passed
    if(!dCoords.length) dCoords = [dCoords];

    var self = this;
    var entrance = self.getEntrance();
    var eCoords = self.tileController.getCoords(entrance);
    eCoords = self.coordsMap2Canvas(eCoords);

    _.each(dCoords, function (mapCoords) {
        var dCoords = {
            left: Math.round(eCoords.left + mapCoords.x*100),
            top: Math.round(eCoords.top + mapCoords.y*100)
        };
        var t = new EmptyTile(dCoords);
        self.setDungeonCoords(t, mapCoords);
        self.map.addWithUpdate(t);
    });
};

/*
* removes empty tile if any at dCoords
* @dCoords - tile coords at map
* */
cMapController.prototype.removeEmptyTile = function (dCoords) {
    var t = this.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    this.map.remove(t);
    this.canvas.renderAll();
};

/*
* highlights the tile at dCoords
* */
cMapController.prototype.selectEmptyTile = function (dCoords) {
    var t = this.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    this.tileController.set(t, {
        fill: '#999'
    });
    this.canvas.renderAll();
};

/*
* resets highlight of tile at dCoords
* */
cMapController.prototype.unselectEmptyTile = function (dCoords) {
    var t = this.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    this.tileController.set(t, {
        fill: '#fff'
    });
    this.canvas.renderAll();
};

/*
* Finds empty tile under @tile and returns its dungeonCoords
* @tile - tile object
* */
cMapController.prototype.findEmptyUnderTile = function (tile) {
    //look for the empty tile under the center of tile to be attached
    //var self = this;
    var tileCenter = this.tileController.getCoords(tile);
    var dCoords = this.findDungeonCoords(tileCenter);
    if(!this.hasTileAt(dCoords,'emptyTile'))return;
    return dCoords;
};

/*
* Finds dCoords of tile which should contain the point on canvas
* @return - dCoords {x,y}
* @point - coords of point on canvas {left, top}
* */
cMapController.prototype.findDungeonCoords = function (point) {
    var mPoint = this.coordsCanvas2Map(point); //coordinates of point in map
    var entrance = this.getEntrance();
    var eCoords = this.tileController.getCoords(entrance); //coordinates of entrance in map
    var size = this.tileController.getSize(entrance);
    return {
        x: Math.round((mPoint.left - eCoords.left)/size.width),
        y: Math.round((mPoint.top - eCoords.top)/size.height)
    };
};

/*
* checks if point is inside of rectangle. Doesn't take angle into account
* @return - boolean.
* */
function contains(rect, point) {
    //checks if rectangle defined by left,top,width,height contains point
    if(point.left < rect.left || point.left > rect.left+rect.width) return false;
    return !(point.top < rect.top || point.top > rect.top + rect.height);

}

/*
* Adds event handlers to map object
* @eventMap - array of event descriptors {name, handler}
* */
cMapController.prototype.addEventHandlers = function (eventMap) {
    //add event handlers for map
    var map = this.map;
    //set event maps on map
    _.forEach(eventMap, function (event) {
        map.on(event.name, event.handler);
    });
};


/*
* Default handler of dblclick on map
* */
function handleMapDblClick (options) {
    if(!options.e) return;
    //click coords relative to canvas
    var cCoords = {
        left: options.e.offsetX,
        top: options.e.offsetY
    };
    var dCoords = this.findDungeonCoords(cCoords);
    if(!this.hasMapTileAt(dCoords))return;
    this.map.fire('map:detach', {
        action: 'detach tile',
        dCoords: dCoords
    });
}