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
        //this.on('mouseup', this.onMouseUp);
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
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

cMap.prototype.getCoords = function () {
    return {
        left: this.left,
        top: this.top
    };
};


/*
 * @return -  cTile on map with specified id
 * @id - tile id
 * */
cMap.prototype.getTileById = function (id) {
    var result;
    this.forEachObject(function (tile) {
        if(tile.getId() === id) result = tile;
    });
    return result;
}

/*
 * @return - map entrance tile object
 * */
cMap.prototype.getEntrance = function () {
    return this.item(0);
};

/*
 * @return - return tile of specified type with specific dCoords
 * @dCoords - {x,y} tile coords on dungeon map with reference to entrance tile {x:0,y:0}
 * @type - (optional) type of tile: emptyTile or cTile. If not defined search for any type
 * */
cMap.prototype.getTileAt = function (dCoords, type) {
    var tiles = this.getObjects(type);
    var t = _.find(tiles, function (t) {
        var currentDCoords = t.getDungeonCoords();
        return currentDCoords.x === dCoords.x && currentDCoords.y === dCoords.y;
    });
    return t;
};

/*
 * checks if there is a tile at dCoords
 * @return - boolean
 * @type - (optional) type of the tile to check
 * */
cMap.prototype.hasTileAt = function (dCoords, type) {
    return Boolean(this.getTileAt(dCoords, type));
};

/*
 * checks if there is a mapTile at dCoords
 * @return - boolean
 * */
cMap.prototype.hasMapTileAt = function (dCoords) {
    return this.hasTileAt(dCoords, 'cTile');
};

/*
 * @return - array of dCoords of emptyTiles around the reference
 * @dCoords - dCoords of the reference point
 * */
cMap.prototype.getEmptyNeighborsDCoords = function (dCoords) {
    var candidates = neighborsCoords(dCoords);
    var result = [];
    _.each(candidates, function (c) {
        if(this.hasTileAt(c, 'emptyTile'))
            result.push(c);
    }, this);
    return result;
};

/*
 * @return - array of dCoords {x,y} without any tiles
 * @dCoords - coordinates of center
 * */
cMap.prototype.getNeighborsWithoutTiles = function (dCoords) {
    var candidates = neighborsCoords(dCoords);
    var result = [];
    _.each(candidates, function (c) {
        if(!this.hasTileAt(c))
            result.push(c);
    }, this);
    return result;
};

/*
 * @return - boolean. True if any of the tile neighbors aren't empty
 * @dCoords - coords of tile on map
 * */
cMap.prototype.hasTileNeighbour = function(dCoords) {
    var candidates = neighborsCoords(dCoords);
    return Boolean(_.find(candidates, function (c) {
        return this.hasTileAt(c, 'cTile');
    }, this));
};

function neighborsCoords(dCoords) {
    return [
        {x: dCoords.x + 1, y: dCoords.y},
        {x: dCoords.x - 1, y: dCoords.y},
        {x: dCoords.x    , y: dCoords.y + 1},
        {x: dCoords.x    , y: dCoords.y - 1},
    ];
}