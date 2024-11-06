const { DatabaseManager } = require('../config/db');
const { createHash } = require('crypto');

/**
 * Generates a salt sequence for the password encryption
 * @returns a random 32-characters string as a salt sequence
 */
const generateSalt = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,;:!§/.?ù%*µ$£^=+°@àç_`|()[]{}#~&'
    const characters_length = characters.length;
    let salt = '';
    for(let i=0; i < 32; i++){
        salt = salt.concat(characters.charAt(Math.floor(Math.random() * characters_length)));
    }
    return salt;
}

const getNextUserID = () => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const getID = db.prepare('SELECT MAX(id_con) AS nextID FROM cyb_connect;');
        const maxID = getID.get();
        return parseInt(maxID.nextID) + 1;

    } catch (err){
        console.log('Error with the user verification ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Generates a random salt sequence, concatenates it to the password given as a parameter 
 * and returns a tuple containing the SHA512 result and the plain-text salt sequence.
 * @param {*} password password given by the user
 */
const encryptAndSaltPassword = (password) => {
    const salted = generateSalt();
    let preparedPassword = password.concat(salted);
    const pwd = createHash('sha512').update(preparedPassword).digest('hex');
    return {password: pwd, salt: salted};
}

/**
 * Counts the number of users with the same username
 * @param {*} username string containing the user name.
 * @returns an integer corresponding to the users in the cyb_connect table that have the same username 
 * than the one given as a parameter and the id of the concerned user. nb: tables cyb_connect and cyb_users 
 * have the same primary key values (they match for the same user).
 */
const countUsername = (username) => {
    db = DatabaseManager.getInstance();
    if (!db){
        throw new Error('Database is not initialised');
    }
    const usernameReq = db.prepare('SELECT id_con, COUNT(username_con) AS number FROM cyb_connect WHERE username_con = ?;');
    const countUsr = usernameReq.get(username);
    return {id: countUsr.id_con, count: countUsr.number};

}


/**
 * Returns all data related to a specific username
 * @param {*} userID: id of the user
 */
const getUserData = (userID) => {
    db = DatabaseManager.getInstance();
    if (!db){
        throw new Error('Database is not initialised');
    }
    const req = db.prepare('SELECT username_usr AS username, role_usr AS role, status_usr AS status, email_usr as email FROM cyb_users WHERE id_usr = ?;');
    const userData = req.get(parseInt(userID));
    return userData;
}


/**
 * Returns all data related all users in the database
 * @param {*} userID
 */
const getAllUsersData = () => {
    db = DatabaseManager.getInstance();
    if (!db){
        throw new Error('Database is not initialised');
    }
    const req = db.prepare('SELECT username_usr AS username, role_usr AS role, status_usr AS status, email_usr AS email FROM cyb_users;');
    const usersData = req.all();
    return usersData;
}


/**
 * compares a sha512 password with the password corresponding to the id given as a parameter
 * @param {*} id 
 * @param {*} pwd 
 * @returns true if they both match, else false
 */
const comparePasswords = (id, pwd) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        let isValid = false;
        const countValidAuth = db.prepare('SELECT COUNT(username_usr) AS number FROM cyb_users WHERE id_usr = ? AND password_usr = ?;');
        const compare = countValidAuth.get(id, pwd);
        if (parseInt(compare.number) === 1){
            isValid = true;
        }
        return isValid;
    } catch (err){
        console.log('Error with the authentication verification ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}

/**
 * Method that counts the number of 
 * @param {*} userID 
 * @returns 
 */
const countByID = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const countUserID = db.prepare('SELECT COUNT(id_usr) AS number FROM cyb_users WHERE id_usr = ?;');
        const nb = countUserID.get(parseInt(userID));
        return nb.number;
    } catch (err){
        console.log('Error while trying to count by id: ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}

/**
 * deletes a user from the database: removes it from both cyb_connect and cyb_users tables
 * @param {*} userID 
 */
const completeUserDeletion = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const deleteTotally = db.transaction((id) => {
            const delFromUsers = db.prepare('DELETE FROM cyb_users WHERE id_usr = ?;');
            const delFromConnect = db.prepare('DELETE FROM cyb_connect WHERE id_con = ?;');

            delFromUsers.run(id);
            delFromConnect.run(id);
        });
        deleteTotally(parseInt(userID));
    } catch (err){
        console.log('Error with the deletion of a user: ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
};

/**
 * Returns the salt sequence associated with a specific user ID
 * @param {*} userID 
 * @returns a 32-length-plain-text-string
 */
const getSalt = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT salt_usr FROM cyb_users WHERE id_usr = ?;');
        const salt = req.get(parseInt(userID));
        return salt.salt_usr;
    } catch (error) {
        console.log('Error while trying to retrieve a username salt sequence');
        throw new error('Error while trying to retrieve a username salt sequence: ', error)
    }
}

/**
 * Gets the ID that corresponds to a specific username
 * @param {*} username 
 * @returns 
 */
const getID = (username) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT id_con FROM cyb_connect WHERE username_con = ?;');
        const userID = req.get(username);
        return userID.id_con;
    } catch (error) {
        console.log('Error while trying to retrieve a specific ID');
        throw new error('Error while trying to retrieve a specific ID: ', error)
    }
}


/**
 * Returns the role of a user which id is given as a parameter. role can be "admin" or "staff"
 * @param {*} id 
 */
const getUserRole = (id) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT role_usr FROM cyb_users WHERE id_usr = ?;');
        const role = req.get(id);
        return role.role_usr;
    } catch (error) {
        console.log('Error while trying to retrieve a user role');
        throw new error('Error while trying to retrieve a user role: ', error)
    }
}



/**
 * Gets and returns the status of a user which ID is given as a parameter
 * @param {*} userID an integer 
 * @returns a string: 'active' or 'inactive'
 */
const getUserStatus = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT status_usr FROM cyb_users WHERE id_usr = ?;');
        const count = req.get(parseInt(userID));
        return count.status_usr;
    } catch (err){
        console.log('Error while trying to get a user status', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * Gets a username from the user ID
 * @param {*} userID integer
 * @returns a string
 */
const getNameFromID = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT username_usr FROM cyb_users WHERE id_usr = ?;');
        const usr = req.get(parseInt(userID));
        return usr.username_usr;
    } catch (err){
        console.log('Error while trying retrieve a username from its ID ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


/**
 * updates a user in the users database
 * @param {*} userID 
 * @returns 
 */
const updateInUsr = (user) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('UPDATE cyb_users SET username_usr = ?, password_usr = ?, salt_usr = ?, email_usr = ?, status_usr = ?, role_usr = ? WHERE id_usr = ?;');
        req.run(user.username, user.password, user.salt, user.email, user.status, user.role, parseInt(user.id));
    } catch (err){
        console.log('Error while trying to update the users table', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}

/**
 * Updates the connection table
 * @param {*} userID 
 * @param {*} username 
 * @returns 
 */
const updateInCon = (user) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('UPDATE cyb_connect SET username_con = ? WHERE id_con = ?;');
        req.run(user.username, parseInt(user.id));
    } catch (err){
        console.log('Error while trying to update the connection table', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}



const getPassword = (userID) => {
    try {
        db = DatabaseManager.getInstance();
        if (!db){
            throw new Error('Database is not initialised');
        }
        const req = db.prepare('SELECT username_usr FROM cyb_users WHERE id_usr = ?;');
        const usr = req.get(parseInt(userID));
        return usr.username_usr;
    } catch (err){
        console.log('Error while trying retrieve a username from its ID ', err.message);
        if (db && !db.inTransaction) {
            throw err;
        }
    }
}


module.exports = {
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
};
