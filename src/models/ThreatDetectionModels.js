const Database = require('better-sqlite3');
const path = require('path')
const {DatabaseManager} = require('../config/db');


const getRegularExpressions = () => {
    let db;
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const sqlRequest = "SELECT regex_ftr, type_typ FROM cyb_filters JOIN cyb_types USING (id_typ) ORDER BY type_typ ASC;";
        const getRegExpAndTypes = db.prepare(sqlRequest);
        const results = getRegExpAndTypes.all();
        return results;
    } catch (err){
        console.log('with error name is ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


module.exports = {
    getRegularExpressions,
}
