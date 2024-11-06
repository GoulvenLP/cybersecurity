const Database = require('better-sqlite3');
const path = require('path')
const {DatabaseManager} = require('../config/db');
const fs = require('fs');


const getRegularExpressions = () => {
    let db;
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT regex_ftr AS regex, type_typ AS type FROM cyb_filters JOIN cyb_types USING (id_typ) ORDER BY type ASC;');
        const results = req.all();
        return results;
    } catch (err){
        console.log('with error name is ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Gets all the logs in the logfile
 * @returns a string
 */
const getAllLogs = () => {
    const logFilePath = path.join(__basedir, 'logs.txt');
    const logs = fs.readFileSync(logFilePath, 'utf8');
    return logs;
}


module.exports = {
    getRegularExpressions,
    getAllLogs,
}
