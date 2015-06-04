/**
 * Created by vbelolapotkov on 24/04/15.
 */
Routes = {
    home: {
        name: new ReactiveVar('Home')
    },
    game: {
        template: 'GameTablesGamePage',
        name: 'GameTables.Game',
        data: function () {
            return {tableId: this.params.tableId};
        }
    }
};

GameTables = {
    getTablesTemplate: function () {
        return 'GameTablesList';
    },
    setHomeRoute: function (routeName) {
        Routes.home.name.set(routeName);
    },
    setGameUrl: function (routeUrl) {
        Router.route(routeUrl, Routes.game);
    },
    /*
     * Provides cursor to set observers
     * */
    getPlayersCursor:function (tableId) {
        return Players.find({tableId: tableId});
    }
};

