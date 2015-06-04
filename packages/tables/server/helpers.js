/**
 * Created by vbelolapotkov on 29/04/15.
 */
GameTables = {
    registerGame: function (gd) {
        //gd - short for game descriptor object
        var pattern = {
            gameName: String,
            displayName: String,
            gameTemplate: String,
            boxImgUrl: String,
            shortDescription: String
        };
        check(gd, Match.ObjectIncluding(pattern));

        var num = Games.update(
            {gameName: gd.gameName},
            {$set: {
                gameName: gd.gameName,
                displayName: gd.displayName,
                gameTemplate: gd.gameTemplate,
                boxImgUrl: gd.boxImgUrl,
                shortDescription: gd.shortDescription
                }
            },
            {upsert: true}
        );
        return num > 0;
    },
    /*
    * Returns username and tableId from userId string
    * @return - {Object} name: nickname, tableId: tableId
    * @param - {String} userId
    * */
    parseUserId: function (userId) {
        var gT = new GameTable('0');
        return gT.parseUserId(userId);
    }
};