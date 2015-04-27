Template.GameTablesList.onCreated(function () {
    var instance = this;
    //Reactive vars
    instance.ready = new ReactiveVar(false); //wait for tables list

    //subscribe for data in autorun
    Tracker.autorun(function () {
        var subs = Meteor.subscribe('gameTablesList');
        if(subs.ready()) instance.ready.set(true);
        else instance.ready.set(false);
    });
});


Template.GameTablesList.helpers({
    tables: function () {
        return Tables.find();
    },
    isReady: function () {
        return Template.instance().ready.get();
    }
});
