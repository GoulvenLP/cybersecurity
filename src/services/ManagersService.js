const {DatabaseManager} = require('../config/db');
const { createHash } = require('crypto');
const { 
    generateSalt,
    getNextUserID,
    countUsername,
    getUserData,
    encryptAndSaltPassword,
    comparePasswords,
    countByID,
    completeUserDeletion,
    getSalt,
    getID,
    getUserRole,
    getUserStatus,
    getAllUsersData,
    getNameFromID,
    updateInUsr,
    updateInCon,
    getPassword,
} = require('../models/ManagersModels');


/**
 * Creates and adds a new user to the database. The password is added in a SH512 encryption.
 * @param {*} newUser JSON object containing the username, password, role and email
 * @returns 
 */
const newUser = (newUser) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        if (!newUser || newUser == null){
            return false;
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
            const createUsrInUsersTable = db.prepare('INSERT INTO cyb_users (id_usr, username_usr, password_usr, role_usr, status_usr, email_usr, salt_usr, id_con)  VALUES (?, ?, ?, ?, ?, ?, ?, ?);');

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
const findIfUserID = (userID) => {
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
    const isFound = findIfUserID(userID);
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
 * Gets the role of a user whose ID is given as a parameter
 * @param {*} id 
 */
const  getTargetRole = (id) => {
    const role = getUserRole(id);
    return role;
}


const getAllUsers = () => {
    const allUsers = getAllUsersData();
    return allUsers;
}


/**
 * Updates a user data in a few steps with the admin rights
 * @param {*} update 
 */
const updateUsr_admin = (update) => {
    // manage username
    let username = getNameFromID(update.targetID);
    console.log('USERNAME : ', username);
    console.log("UPDATE USERNAME: ", update.username);
    if (update.username !== ""){ //username changed
        console.log("WE DO ENTER THERE???");
        if (username !== update.username){ //if the username has changed -> verify if it is not already in the database
            number = countUsername(username);
            if (number === 1){ //there is already a user with that name
                return false;
            }
        }
        username = update.username;
    }
    const userData = getUserData(update.targetID); //one request instead of 3
    // manage email
    let email = userData.email;
    if (update.email !== '') {
        if (email !== update.email){
            email = update.email;
        }
    }
    //manage password
    credentials = encryptAndSaltPassword(update.password);
    let salt = null;
    if (update.password === ''){ //keep the current password
        salt = getSalt(update.targetID);
        const pwd = getPassword(update.targetID);
        credentials = { password: pwd, salt: salt};
    } else {
        if (update.password === credentials.password){ //same password
            salt = getSalt(update.targetID);
            credentials = { password: update.password, salt: salt };
        }
    }
    let role = null;
    let status = null;
    // an admin cannot modify his own roles or status
    if (update.userID === update.targetID){ //do not modify these fields
        role = userData.role;
        status = userData.status;
    } else {
        role = update.role;
        status = update.status;
        if (update.role === ''){ //keep the current role
            role = userData.role;
        }
        if (update.status === ''){
            status = userData.status;
        }
    }
    updateInUsr({ id: update.targetID, username: username, password: credentials.password, salt: credentials.salt, email: email, role: role, status: status });
    updateInCon({ id: update.targetID, username: username });
    return true;
}

/**
 * Updates a user data in a few steps with the staff rights
 * A staff member cannot modify nor his role nor his status.
 * @param {*} update 
 */
const updateUsr_staff = (update) => {
    // manage username
    let username = getNameFromID(update.targetID);
    if (update.username !== ''){ //username changed
        if (username !== update.username){ //if the username has changed -> verify if it is not already in the database
            number = countUsername(username);
            if (number === 1){ //there is already a user with that name
                return false;
            }
        }
        username = update.username;
    }
    const userData = getUserData(update.targetID); //one request instead of 3
    // manage email
    let email = userData.email;
    if (update.email !== '') {
        if (email !== update.email){
            email = update.email;
        }
    }
    //manage password
    credentials = encryptAndSaltPassword(update.password);
    let salt = null;
    if (update.password === ''){ //keep the current password
        salt = getSalt(update.targetID);
        const pwd = getPassword(update.targetID);
        credentials = { password: pwd, salt: salt};
    } else {
        if (update.password === credentials.password){ //same password
            salt = getSalt(update.targetID);
            credentials = { password: update.password, salt: salt };
        }
    }
   const role = userData.role;
   const status = userData.role
   updateInUsr({ id: update.targetID, username: username, password: credentials.password, salt: credentials.salt, email: email, role: role, status: status });
   updateInCon({ id: update.targetID, username: username });
    return true;
}


module.exports = {
    newUser,
    deleteUserByID,
    retrieveUser,
    getAllUsers,
    getUserID,
    findIfUserID,
    verifyAuthentication,
    getTargetRole,
    updateUsr_admin,
    updateUsr_staff,
}