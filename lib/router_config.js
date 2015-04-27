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