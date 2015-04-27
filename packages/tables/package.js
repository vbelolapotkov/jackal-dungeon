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
        'meteor-platform',
        'check'
    ], both);

    api.use([
        'reactive-var',
        'sacha:spin',
        'twbs:bootstrap'
    ], 'client');

    //common files
    api.addFiles([
        'collections.js',
        'game_table_common.js'
    ], both);

    //server files
    api.addFiles([
        'server/init.js',
        'server/methods.js',
        'server/game_table_server.js'
    ], 'server');

    //client files
    api.addFiles([
        'client/lib/helpers.js',
        'client/lib/game_table_client.js',
        'client/views/game_tables.html',
        'client/views/game_tables.js',
        'client/views/table.html',
        'client/views/table.js',
        'client/views/new_player_form.html',
        'client/views/new_player_form.js',
        'client/views/tables.css',
    ],'client');

    api.export('GameTables', both);
});