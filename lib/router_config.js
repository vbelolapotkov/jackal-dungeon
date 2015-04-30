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

Router.route('/',Routes.home);

//configure routes for game tables package
if(Meteor.isClient) {
    GameTables.setHomeRoute(Routes.home.name);
    GameTables.setGameUrl('/games/:tableId');
}
