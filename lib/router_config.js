/**
 * Created by vbelolapotkov on 23/04/15.
 */
Router.configure({
    layoutTemplate: 'JDLayout',
    notFoundTemplate: 'JDNotFound'
});

var Routes = {};
Routes.home = {
    template: 'JDHome',
    name: 'JD.Home'
}

Routes.game = {
    template: 'JDGame',
    name: 'JD.Game',
    data: function () {
        return {tableId: this.params.tableId};
    }
}

Router.route('/',Routes.home);
Router.route('/games/:tableId', Routes.game);

//configure routes for game tables package

if(Meteor.isClient) {
    GameTables.setHomeRoute(Routes.home.name);
    GameTables.setGameRoute(Routes.game.name);
}
