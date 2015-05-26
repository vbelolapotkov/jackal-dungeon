/**
 * Created by vbelolapotkov on 26/05/15.
 */
JDPiratesController = function (options) {
    this.tableId = options.tableId;
    this.mapController = options.mapController;
    this.piratesController = new cPiratesController(options.canvas);

    this.loadPlayers();
}

JDPiratesController.prototype.loadPlayers = function () {
    var eCoords = this.mapController
    var options = {
        fill: '#f00',

    }
};