const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');


class DatabaseManager {

    constructor(){
        this._db = null;
        this.initializeDB();
    }

    initializeDB = () => {
        try {
            this._db = new Database('database.db');
            const sql = fs.readFileSync(path.join(__dirname, './database.sql'), 'utf8');
            this._db.exec(sql);
            console.log('Database initialised successfully');
        } catch (error) {
            throw new Error(error);
        };
    };


    getDB(){
        if(!this._db){
            throw new Error('Database is not initialised');
        } else {
            return this._db;
        }
    }


    closeDB(){
        if (this._db) {
            this._db.close();
            this._db = null;
            console.log('Database connection closed');
        }
    }

}



module.exports = {
    DatabaseManager,
}