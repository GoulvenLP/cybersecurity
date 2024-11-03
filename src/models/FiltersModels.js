const { DatabaseManager } = require('../config/db');


/**
 * Gets all the available filters and their related informations.
 * @returns an array of these filters.
 */
const getAllFilters = () => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT id_ftr AS id, username_usr AS username, regex_ftr AS regex, description_ftr AS description, type_typ AS type, last_update_ftr AS date FROM cyb_filters JOIN cyb_connect USING (id_con) JOIN cyb_users USING (id_con) JOIN cyb_types USING (id_typ);');
        const filters = req.all();
        return filters;

    } catch (err){
        console.log('Error while to access the filters ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Gets the next available ID type of the cyb_type table;
 * @returns an integer
 */
const getNextIDType = () => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT MAX(id_typ) AS nextID FROM cyb_types;');
        const maxID = req.get();
        return parseInt(maxID.nextID) + 1;

    } catch (err){
        console.log('Error while trying to get the next ID type ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}

/**
 * Gets the next available ID filter of the database;
 * @returns an integer
 */
const getNextIDFilter = () => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT MAX(id_ftr) AS nextID FROM cyb_filters;');
        const maxID = req.get();
        return parseInt(maxID.nextID) + 1;

    } catch (err){
        console.log('Error while trying to get the next ID filter ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Gets the id of a specified type
 * @param {*} typeName string corresponding to the type
 * @returns an integer
 */
const getIDofType = (typeName) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT id_typ AS id FROM cyb_types WHERE type_typ = ?;');
        const type = req.get(typeName);
        return type.id;

    } catch (err){
        console.log('Error while trying to access a specific ID for a type of filter ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Inserts a new type into the cyb_type table
 * @param {*} newType 
 */
const insertNewType = (newType) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('INSERT INTO cyb_types (id_typ, type_typ) VALUES (?, ?);');
        req.run(newType.id, newType.type);

    } catch (err){
        console.log('Error while trying to insert a new type ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Inserts a new filter into the table cyb_filters
 * @param {*} newFilter 
 */
const insertNewFilter = (newFilter) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('INSERT INTO cyb_filters (id_ftr, regex_ftr, description_ftr, created_ftr, last_update_ftr, id_typ, id_con) VALUES (?, ?, ?, ?, ?, ?, ?);');
        req.run(parseInt(newFilter.id), newFilter.regex, newFilter.description, Date.now(), Date.now(), parseInt(newFilter.typeID), parseInt(newFilter.userID));

    } catch (err){
        console.log('Error while trying to insert a new filter ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}

/**
 * Removes a filter from the table cyb_filters
 * @param {} filterID id of the filter that has to be removed from the table 
 */
const removeFilter = (filterID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('DELETE FROM cyb_filters WHERE id_ftr = ?;');
        req.run(parseInt(filterID));
    } catch (err){
        console.log('Error while trying to remove a filter ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Counts the number of ID associated to a specific filter ID
 * @param {*} filterID 
 * returns an integer
 */
const countFilterID = (filterID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT COUNT(id_ftr) as number FROM cyb_filters WHERE id_ftr = ?;');
        const ct = req.get(parseInt(filterID));
        return ct.number;
    } catch (err){
        console.log('Error while trying to count the number of filters associated to an ID ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


const countTypesOfID = (typeID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT COUNT(id_typ) as number FROM cyb_types WHERE id_typ = ?;');
        const count = req.get(parseInt(typeID));
        return count.number;
    } catch (err){
        console.log('Error while trying to count the number of types associated to an ID ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


module.exports = {
    getAllFilters,
    getNextIDFilter,
    countFilterID,
    countTypesOfID,
    getNextIDType,
    getIDofType,
    insertNewType,
    insertNewFilter,
    removeFilter,
}