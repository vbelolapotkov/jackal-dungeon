cMapController = function (canvas) {
    this.canvas = canvas;
    //try to find map if it exists on canvas
    this.map = this.findMap();
};


/*
* @return - cMap. Map object on canvas. Undefined if not found
* */
cMapController.prototype.findMap = function () {
    var objects = this.canvas.getObjects('cMap');
    if(!objects) return;
    if(objects.length>1)
        console.log('cMapController: Warning, more than one map found. Returning first one');
    return objects[0];
};

/*
* Logs error if trying to operate on undefined map
* */
cMapController.prototype.logNotFound = function (method) {
    console.error('cMapController: Error in %s. Attempt to operate with undefined map', method);
    console.trace();
};

/*
* adds map to canvas
* @tiles - array of tile options to create new tiles
* @callback - callback function with one bool parameter - the result of map creation
* */
cMapController.prototype.createMap = function (entrance, callback) {
    //todo: modify to return map in callback
    var self = this;
    var coords = {
        left: Math.round(self.canvas.getWidth()/20)*10,
        top: Math.round(self.canvas.getHeight()/20)*10
    };
    //entrance tile should be first in the array
    if(entrance.type !== 'entrance') {
        callback();
        return;
    }

    cTile.fromURL({
        url: entrance.url,
        id: entrance.id
    }, function (eTile) {
        eTile.setMapStyle();
        eTile.setDungeonCoords({x:0, y:0});
        self.map = new cMap([eTile],coords);
        self.canvas.add(self.map);
        self.addEmptyTiles([
            {x: 1, y: 0},
            {x:-1, y: 0},
            {x: 0, y: 1},
            {x: 0, y:-1},
        ]);
        self.canvas.renderAll();

        self.map.on('object:dblclick', handleMapDblClick.bind(self));
        callback(self.map);
    });
};

/*
* @return - map entrance coords relative to canvas object
* */
cMapController.prototype.getEntranceCoords = function () {
    if(!this.map) {
        this.logNotFound('getEntranceCoords');
        return;
    };
    var e = this.map.getEntrance();
    return this.coordsMap2Canvas(e.getCoords());
};

/*
* @return - tile coords relative to map entrance
* @tile - tile object or id
* */
cMapController.prototype.getRelCoords = function (tile) {
    var eCoords = this.getEntranceCoords();
    var tC = new cTileController(this.canvas);
    return tC.getRelCoords(tile, eCoords);
}

/*
* converts coords in map object to coords on canvas taking into account map object offset on canvas
* @mCoords - {left, top} - pixel coords in map coordinate system
* */
cMapController.prototype.coordsMap2Canvas = function (mCoords) {
    //applies map offset in canvas to map object
    if(!mCoords) mCoords = {left: 0, top: 0};
    if(!this.map) {
        this.logNotFound('coordsMap2Canvas');
        return;
    };
    var offset = this.map.getCoords();

    return {
        left: mCoords.left + offset.left,
        top: mCoords.top + offset.top
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

    if(!this.map) {
        this.logNotFound('coordsCanvas2Map');
        return;
    };
    var offset = this.map.getCoords();

    return {
        left: cCoords.left - offset.left,
        top: cCoords.top - offset.top
    };
};

/*
* sets tile coordinates equal to map tile with dCoords;
* @tile - tile which coordinates are modified
* @dCoords - {x,y} tile coordinates on map with ref to entrance
* */
cMapController.prototype.alignTile = function (tile, dCoords) {
    if(!this.map) {
        this.logNotFound('alignTile');
        return;
    };
    var t = this.map.getTileAt(dCoords);
    var mCoords = t.getCoords(); //{left, top} with ref to map
    var cCoords = this.coordsMap2Canvas(mCoords); //{left, top} with ref to canvas
    tile.setCoordsWithUpdate(cCoords);
};

/*
*attache tile to map at specified coords {x,y}
* @tile - tile to be attached
* @
* */
cMapController.prototype.attachTile = function (tile, dCoords) {
    //tile - tile obj on canvas or tile options
    if(!this.map) {
        this.logNotFound('attachTile');
        return;
    };
    var self = this;
    var tileController = new cTileController(this.canvas);

    //local func to replace common sequence of actions on attach
    var updateCanvasOnAttach = function (t, dCoords) {
        t.setMapStyle();
        t.setDungeonCoords(dCoords);
        self.map.addWithUpdate(t);
        self.removeEmptyTile(dCoords);
        self.addEmptyTiles(self.map.getNeighborsWithoutTiles(dCoords));
        self.map.setCoords();
        self.canvas.renderAll();
    };

    if(!tileController.isTile(tile)) {
        //tile - tile options
        var entrance = self.map.getEntrance();
        var eCCoords = self.coordsMap2Canvas(entrance.getCoords());
        //todo: replace fixed number to tile size
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
                updateCanvasOnAttach(tObj, dCoords);
        });
    } else {
        if(self.map.hasTileAt(dCoords, 'cTile')) {
            return;
        }
        tile.remove();
        self.alignTile(tile, dCoords);
        updateCanvasOnAttach(tile, dCoords);
    }
};

/*
* @return - detached tile object or undefined
* @dCoords - dungeon coords of tile to be detached
* */
cMapController.prototype.detachTile = function (dCoords) {
    if(!this.map) {
        this.logNotFound('detachTile');
        return;
    };
    //1. Find tile object on map
    var tile = this.map.getTileAt(dCoords, 'cTile');
    if(!tile) return;
    //2. Remove tile from map
    this.map.removeWithUpdate(tile);

    //3. Remove add empty tiles
    //add empty tile under removed tile
    var emptyNeighboursCoords = this.map.getEmptyNeighborsDCoords(dCoords);
    var tilesToRemoveCoords = _.filter(emptyNeighboursCoords,
        function (coords) {
            return !this.map.hasTileNeighbour(coords);
        },
        this);
    if(tilesToRemoveCoords.length > 0)
        _.each(tilesToRemoveCoords, function (dCoords) {
            this.removeEmptyTile(dCoords);
        }, this);
    this.addEmptyTiles(dCoords);

    //4. Render changes
    this.canvas.renderAll();
    return tile;
};

/*
* adds empty tiles at dCoords {x,y}
* @dCoords - array or single tCoord object
* */
cMapController.prototype.addEmptyTiles = function (dCoords) {
    if(!this.map) {
        this.logNotFound('addEmptyTiles');
        return;
    };
    //quit if array is empty
    if(dCoords.length === 0) return;
    //make array if only single object passed
    if(!dCoords.length) dCoords = [dCoords];

    var entrance = this.map.getEntrance();
    var eCoords = entrance.getCoords();
    eCoords = this.coordsMap2Canvas(eCoords);

    _.each(dCoords, function (mapCoords) {
        //todo: replace fixed number with size
        var dCoords = {
            left: Math.round(eCoords.left + mapCoords.x*100),
            top: Math.round(eCoords.top + mapCoords.y*100)
        };
        var t = new EmptyTile(dCoords);
        t.setDungeonCoords(mapCoords);
        this.map.addWithUpdate(t);
    }, this);
};

/*
* removes empty tile if any at dCoords
* @dCoords - tile coords at map
* */
cMapController.prototype.removeEmptyTile = function (dCoords) {
    if(!this.map) {
        this.logNotFound('addEmptyTiles');
        return;
    };
    var t = this.map.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    this.map.remove(t);
    this.canvas.renderAll();
};

/*
* highlights the tile at dCoords
* */
cMapController.prototype.selectEmptyTile = function (dCoords) {
    if(!this.map) {
        this.logNotFound('selectEmptyTile');
        return;
    };
    var t = this.map.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    t.highlight();
    this.canvas.renderAll();
};

/*
* resets highlight of tile at dCoords
* */
cMapController.prototype.unselectEmptyTile = function (dCoords) {
    if(!this.map) {
        this.logNotFound('unselectEmptyTile');
        return;
    };
    var t = this.map.getTileAt(dCoords, 'emptyTile');
    if(!t) return;
    t.resetHighlight();
    this.canvas.renderAll();
};

/*
* Finds empty tile under @tile and returns its dungeonCoords
* @tile - tile object
* */
cMapController.prototype.findEmptyUnderTile = function (tile) {
    if(!this.map) {
        this.logNotFound('findEmptyUnderTile');
        return;
    };
    //look for the empty tile under the center of tile to be attached
    //var self = this;
    var tileCenter = tile.getCoords();
    var dCoords = this.findDungeonCoords(tileCenter);
    if(!this.map.hasTileAt(dCoords,'emptyTile'))return;
    return dCoords;
};

/*
* Finds dCoords of tile which should contain the point on canvas
* @return - dCoords {x,y}
* @point - coords of point on canvas {left, top}
* */
cMapController.prototype.findDungeonCoords = function (point) {
    if(!this.map) {
        this.logNotFound('findDungeonCoords');
        return;
    };
    var mPoint = this.coordsCanvas2Map(point); //coordinates of point in map
    var entrance = this.map.getEntrance();
    var eCoords = entrance.getCoords(); //coordinates of entrance in map
    var size = entrance.getSize();
    return {
        x: Math.round((mPoint.left - eCoords.left)/size.width),
        y: Math.round((mPoint.top - eCoords.top)/size.height)
    };
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
    if(!this.map.hasMapTileAt(dCoords))return;
    this.map.fire('map:detach', {
        action: 'detach tile',
        dCoords: dCoords
    });
}