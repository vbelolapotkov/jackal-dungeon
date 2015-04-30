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

    api.addFiles([], both);

    api.addFiles([
        'server/init.js'
    ], 'server');

    api.addFiles([
        'client/views/game_main.html',
        'client/views/game_main.js',
        'img/box.jpg'
    ], 'client');

    //api.export('GameJD',both);
})
