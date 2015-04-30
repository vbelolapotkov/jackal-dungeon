//init collections
if(Tables.find().count()<1) {
    //insert initial entries
    Tables.insert({
        displayName: "Стол 1",
        seatCnt: 100,
        gameName: '',
        gameDisplayName: ''
    });
    Tables.insert({
        displayName: "Стол 2",
        seatCnt: 100,
        gameName: '',
        gameDisplayName: ''
    });
    Tables.insert({
        displayName: "Стол 3",
        seatCnt: 100,
        gameName: '',
        gameDisplayName: ''
    });
}