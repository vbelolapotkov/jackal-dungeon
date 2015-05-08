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
        'client/lib/fabric.js',
        'client/lib/tiles.js',
        'client/lib/deck.js',
        'client/lib/jd.js',
        'client/views/tile_controls.html',
        'client/views/tile_controls.css',
        'client/views/tile_controls.js',
        'client/views/game_main.html',
        'client/views/game_main.js'
    ], 'client');

    //api.export('GameJD',both);
});
