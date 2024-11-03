const {DatabaseManager} = require('../config/db');
const { createHash } = require('crypto');
const { 
    getID,
    getNextUserID,
    countUsername,
    getUserData,
    encryptAndSaltPassword,
    countByID,
    comparePasswords,
    completeUserDeletion,
    getSalt,
    getUserStatus,
} = require('../models/ManagersModels');


/**
 * Creates and adds a new user to the database. The password is added in a SH512 encryption.
 * @param {*} newUser JSON object containing the username, password, status and email
 * @returns 
 */
const newUser = (newUser) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const sameUserName = countUsername(newUser.username);
        // username already used in the database
        if (parseInt(sameUserName.count) !== 0){
            return false;
        }
        const id = getNextUserID();
        const saltAndPwd = encryptAndSaltPassword(newUser.password);
        //create user in the cyb_connect table then into cyb_users -- this is a transaction
        const transact = db.transaction((newUser) => {
            const createUsrInConnectTable = db.prepare('INSERT INTO cyb_connect (id_con, username_con) VALUES (?, ?);');
            const createUsrInUsersTable = db.prepare('INSERT INTO cyb_users (id_usr, username_usr, password_usr, status_usr, active_usr, email_usr, salt_usr, id_con)  VALUES (?, ?, ?, ?, ?, ?, ?, ?);');

            createUsrInConnectTable.run(id, newUser.username);
            createUsrInUsersTable.run(id, newUser.username, saltAndPwd.password, 'squad', 'active', newUser.email, saltAndPwd.salt, id); //same id for both tables
        });
        transact(newUser);
        return true;

    } catch (err){
        console.log('Error with the user verification ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
        throw new Error('Error with the user verification ');
    }
}


/**
 * Returns the user personal Data
 * @param {*} userID 
 * @returns 
 */
const retrieveUser = (userID) => {
    const data = getUserData(userID);
    return data;
}


/**
 * Verifies if an authentication is valid
 * @param {*} req POST request
 * @returns true if the authentication matches, else false
 */
const verifyAuthentication = (username, password) => {
    const {id, count} = countUsername(username);
    if (count === 0){
        return false;
    }
    const salt = getSalt(id);
    let craftedPwd = password.concat(salt);
    const hashedPassword = createHash('sha512').update(craftedPwd).digest('hex');
    //user exists
    const isValid = comparePasswords(id, hashedPassword);
    return isValid;
}

/**
 * Searchs for a specific user ID
 * @param {*} userID 
 * @returns true if the ID is found, else false
 */
const findUserID = (userID) => {
    const number = countByID(userID);
    return number == 1;
}

/**
 * deletes a user fro mthe database by its ID
 * @param {*} userID 
 * @returns true if the deletion was successful, oterhwise false
 */
const deleteUserByID = (userID) => {
    completeUserDeletion(userID);
    const isFound = findUserID(userID);
    return !isFound; //returns false if the user is found --> deletion would have failed
}

/**
 * Gets a username id
 * @param {*} username 
 * @returns id
 */
const getUserID = (username) => {
    return getID(username);
}


/**
 * Gets the status of a user whose ID is given as a parameter
 * @param {*} id 
 */
const getTargetStatus = (id) => {
    const status = getUserStatus(id);
    return status;
}



module.exports = {
    newUser,
    retrieveUser,
    findUserID,
    deleteUserByID,
    verifyAuthentication,
    getUserID,
    getTargetStatus,
}