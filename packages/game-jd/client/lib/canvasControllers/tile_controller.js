/**
 * Created by vbelolapotkov on 12/05/15.
 */
cTileController = function (canvas) {
    this.canvas = canvas;
};

/*
* @return - cTile. Tile object on canvas. Return undefined if not found.
* @id - id of the tile
* */
cTileController.prototype.findById = function (id) {
    var canvas = this.canvas;
    var objects = canvas.getObjects('cTile');
    if(!objects) return;
    var tile = _.find(objects, function (obj) {
        return obj.id === id;
    });
    return tile;
};


/*
* @side_effect - creates emptyTile container on canvas
* @coords - canvas coords of new container
* */
cTileController.prototype.createContainer = function (coords) {
    //coordinates of tile center
    this.container = new EmptyTile(coords);
    this.canvas.add(this.container);
};


/*
* @side_effect - asynchronously creates new tile and adds it to canvas.
* Invokes callback, when tile added to canvas.
* @options - tile options.
* @options.coords - canvas coords
* @options.ref - (optional) canvas coords of reference point. If specified coords a relative.
* @options.url - tile img url
* @options.id - tileId
* @options.angle - tile orientation. Default = 0 degrees
* @options.selectable - (optional) boolean.
* @callback - (optional) callback function. Accepts created tile as a parameter.
* */
cTileController.prototype.addNewTile = function (options, callback) {
    var self = this;
    if(!options.coords)
        options.coords = {
            left: self.container.getLeft(),
            top: self.container.getTop()
        };
    if(options.selectable === undefined) options.selectable = true;
    //if relative coords supplied with reference than convert to abs
    if(options.ref) options.coords = rel2abs(options.coords, options.ref);
    var tileOpts = {
        url:options.url,
        id: options.id,
        angle: options.angle || 0,
        left: options.coords.left,
        top: options.coords.top,
        selectable: options.selectable
    };
    cTile.fromURL(tileOpts, function (tile) {
        self.canvas.add(tile);
        if(callback) callback(tile);
    });
};

/*
* @return - cTile. Tile object if tile is id, else do nothing
* @tile - id or tile object
* */
cTileController.prototype.getTile = function (tile) {
    //todo: add more checking on tile
    if (typeof tile === 'string') {
        return this.findById(tile);
    }
    else return tile;
};

/*
* @side_effect - animates tile movement on canvas
* @tile - tileId or cTile object
* @newCoords - tile coords on canvas
* @callback - (optional) callback function, on animation complete
* */
cTileController.prototype.move = function (tile, newCoords, callback) {
    var self = this;
    var t = self.getTile(tile);
    var coords = t.getPosition();
    if(coords.left === newCoords.left && coords.top === newCoords.top) return;

    t.animate(newCoords, {
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            callback && callback(t);
        }
    })
};

/*
* @side_effect - the same as move but with relative coords
* @ref - reference point
* @rel - relative coords
* @callback - (optional) callback on animate complete
* */
cTileController.prototype.moveRel = function (tile, rel, ref, callback) {
    //ref - reference point
    var newCoords = rel2abs(rel, ref);
    this.move(tile,newCoords,callback);
};

/*
 * @side_effect - animates tile rotation on canvas
 * @tile - tileId or cTile object
 * @angle - new angle
 * @callback - (optional) callback function, on animation complete
 * */
cTileController.prototype.rotate = function (tile, angle, callback) {
    var self = this;
    var t = self.getTile(tile);
    if(t.getAngle() === angle) return;

    t.animate('angle',angle, {
        onChange: self.canvas.renderAll.bind(self.canvas),
        onComplete: function () {
            if(callback) callback(t);
        }
    });
};

/*
* @return - tile relative coords
* @tile - tile object or Id
* @ref - reference point
* */
cTileController.prototype.getRelCoords = function (tile, ref) {
    //ref - reference point for relative coords
    var t = this.getTile(tile);
    return abs2rel(t.getPosition(), ref);
};

cTileController.prototype.isTile = function (tile) {
    //checks if the object is tile
    if(!tile) return false;
    return tile.canvas && tile.type === 'cTile';
};

/*
* @return - absolute coords
* @rel - relative coords
* @ref - reference point
* */
function rel2abs (rel, ref) {
    return {
        left: rel.left + ref.left,
        top: rel.top + ref.top
    };
};

/*
* @return - relative coords
* @abs - absolute coords
* @ref - reference point
* */
function abs2rel (abs, ref) {
    return {
        left: abs.left - ref.left,
        top: abs.top - ref.top
    }
}