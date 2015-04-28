/**
 * Created by vbelolapotkov on 24/04/15.
 */
Routes = {
    home: 'Home',
    game: 'App.Game'
};

GameTables = {
    getTablesTemplate: function () {
        return 'GameTablesList';
    },
    setHomeRoute: function (routeName) {
        Routes.home = routeName;
    },
    setGameRoute: function (routeName) {
        Routes.game = routeName;
    }
};

