Package.describe({
    summary: "Jackal The Dungeon",
    version: "0.1.0",
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

    api.addAssets([ 'server/assets/tiles.json' ], 'server');

    api.addFiles([
        'server/map_server.js',
        'server/deck_server.js',
        'server/pirates_server.js',
        'server/gold_server.js',
        'server/dice_server.js',
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
        'client/lib/canvas/c_gold.js',
        'client/lib/canvasControllers/map_controller.js',
        'client/lib/canvasControllers/tile_controller.js',
        'client/lib/canvasControllers/pirates_controller.js',
        'client/lib/canvasControllers/gold_controller.js',
        'client/lib/gameControllers/deck.js',
        'client/lib/gameControllers/dungeon.js',
        'client/lib/gameControllers/table.js',
        'client/lib/gameControllers/pirates.js',
        'client/lib/gameControllers/gold.js',
        'client/lib/gameControllers/game.js',
        'client/lib/jd.js',
        'client/views/jd.css',
        'client/views/tile_controls.html',
        'client/views/tile_controls.js',
        'client/views/pirate_info.html',
        'client/views/pirate_info.js',
        'client/views/select_for_competition.html',
        'client/views/select_for_competition.js',
        'client/views/dice.html',
        'client/views/dice.js',
        'client/views/competition.html',
        'client/views/competition.js',
        'client/views/game_main.html',
        'client/views/game_main.js'
    ], 'client');

    //api.export('GameJD',both);
});
