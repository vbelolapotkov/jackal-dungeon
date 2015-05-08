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
};

//todo: delete temp route when finished
Routes.temp = {
    template: 'GameJDMain',
    name: 'JD.Temp'
};

Router.route('/',Routes.home);
Router.route('/temp',Routes.temp);

//configure routes for game tables package
if(Meteor.isClient) {
    GameTables.setHomeRoute(Routes.home.name);
    GameTables.setGameUrl('/games/:tableId');
}
