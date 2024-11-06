const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');


class DatabaseManager {
    /**
     * Singleton pattern to make sure the database is initialised only once!
     */
    constructor(){
        if (!DatabaseManager.instance) {
            this._db = this.initializeDB();
            DatabaseManager.instance = this;
        }
        return DatabaseManager.instance;
    }


    /**
     * Static method to give external access to the method
     * @returns the initialised database.
     */
    static getInstance = () => {
        if (!this.instance){
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance._db;
    }

    initializeDB = () => {
        try {
            this._db = new Database(path.join(__basedir, 'database', 'database.db'));
            const better_slite3 = fs.readFileSync(path.join(__basedir, 'src/config', 'database.sql'), 'utf8');
            this._db.exec(better_slite3);
            console.log('Database initialised successfully');
            return this._db;
        } catch (error) {
            throw new Error(error);
        };
    };

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