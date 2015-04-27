/**
 * Created by vbelolapotkov on 24/04/15.
 */
Package.describe({
    summary: "Game Tables management",
    version: "0.0.0",
    name: "simterface:game-tables"
});

Package.onUse(function(api) {
    var both = ['client', 'server'];
    api.use([
        'meteor-platform'
    ], both);

    api.use([
        'reactive-var',
        'sacha:spin',
        'twbs:bootstrap'
    ], 'client');

    //common files
    api.addFiles([
        'collections.js'
    ], both);

    //server files
    api.addFiles([
        'server/init.js',
        'server/methods.js'
    ], 'server');

    //client files
    api.addFiles([
        'client/views/game_tables.html',
        'client/views/game_tables.js',
        'client/views/table.html',
        'client/views/table.js',
        'client/views/new_player_form.html',
        'client/views/new_player_form.js',
        'client/views/tables.css',
        'client/lib/helpers.js'
    ],'client');

    api.export('GameTables', both);
});