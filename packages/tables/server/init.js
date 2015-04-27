
GameTables = {};

//init collections
if(Tables.find().count()<1) {
    //insert initial entries
    Tables.insert({
        displayName: "Стол 1",
        seatCnt: 100,
        gameName: 'Шакал',
        state: 'Занят',
        players: []
    });
    Tables.insert({
        displayName: "Стол 2",
        seatCnt: 100,
        gameName: '',
        state: 'Свободен',
        players: []
    });
    Tables.insert({
        displayName: "Стол 3",
        seatCnt: 100,
        gameName: '',
        state: 'Свободен',
        players: []
    });
}