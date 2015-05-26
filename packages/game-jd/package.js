Package.describe({
    summary: "Jackal The Dungeon",
    version: "0.0.0",
    name: "simterface:game-jd"
});

Package.onUse(function (api) {
    var both=['client','server'];

    api.use([
        'meteor-platform',
        'check',
        'simterface:game-tables'
    ], both);

    api.use([
        'reactive-var',
        'twbs:bootstrap',
        'sacha:spin'
    ], 'client');

    api.addFiles([
        'collections.js'
    ], both);

    api.addFiles([
        'server/assets/tiles.json',
        'server/map_server.js',
        'server/deck_server.js',
        'server/jd_server.js',
        'server/publications.js',
        'server/init.js'
    ], 'server');

    api.addFiles([
        'client/lib/canvas/fabric.js',
        'client/lib/canvas/canvas_ext.js',
        'client/lib/canvas/c_tiles.js',
        'client/lib/canvas/c_map.js',
        'client/lib/canvas/c_pirate.js',
        'client/lib/canvasControllers/map_controller.js',
        'client/lib/canvasControllers/tile_controller.js',
        'client/lib/canvasControllers/pirates_controller.js',
        'client/lib/gameControllers/deck.js',
        'client/lib/gameControllers/map.js',
        'client/lib/gameControllers/tile.js',
        'client/lib/gameControllers/pirates.js',
        'client/lib/sync.js',
        'client/lib/jd.js',
        'client/views/tile_controls.html',
        'client/views/tile_controls.css',
        'client/views/tile_controls.js',
        'client/views/game_main.html',
        'client/views/game_main.js'
    ], 'client');

    //api.export('GameJD',both);
});
