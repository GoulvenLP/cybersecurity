const jwt = require('jsonwebtoken');
const { requesterIsAdmin, requesterIsAnyAllowed } = require('../services/FiltersService');
const { getUserStatus, getUserRole } = require('../models/ManagersModels');
const {
    newUser,
    deleteUserByID,
    retrieveUser,
    getAllUsers,
    getUserID,
    verifyAuthentication,
    getTargetRole,
    updateUsr_admin,
    updateUsr_staff,
    findIfUserID,
 } = require('../services/ManagersService');
 
 /**
  * Attempts to connect a user to his profile with his credentials
  * @param {*} req 
  * @param {*} res 
  */
const connect = (req, res) => {
    try {
        const { username, password } = req.body;
        const allowConnection = verifyAuthentication(username, password);
        if (allowConnection){
            const userID = getUserID(username);
            //Generate & deliver token
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign({id: userID, username: username}, secret, {expiresIn: '2h'});
            console.log(`User ${username} of ID ${userID} logged in`);
            res.status(200).cookie('token', token, { 
                httpOnly: true
            })
            .json({message: 'Authentication successful'}); //{httpOnly: true, secure: true}
        } else {
            console.log(`Authentication failed for user of name ${username}`);
            console.log('Authentication failure');
            res.status(400).send('Invalid username or password');
        }
    } catch (error) {
        console.log('Something went wrong during authentication process', error.message);
        res.status(500).send('Internal Server Error');
    }
};


/**
 * Creates a new user in the database.
 * This method is available to active admins only.
 * @param {*} req 
 * @param {*} res 
 */
const createUser = (req, res) => {
    const authorized = requesterIsAdmin(req.user.id);
    // status inactive ; role is not an admin
    if (authorized){
        console.log('User has not the right privileges for creating an account');
        req.status(403).send('You do not have the right privileges for such operation');
        return;
    }
    console.log(`Request for the creation of a new user by user ${req.user.id}`);
    const created = newUser(req.body);
    if (created) {
        console.log('New user successfully created');
        res.status(200).send('New user successfully created');
    } else {
        console.log('Failed on creating a new user');
        res.status(400).send('Failed on creating a new user');
    }
};


/**
 * Removes a user from the database
 * @param {*} req 
 * @param {*} res 
 */
const deleteUser = (req, res) => {
    if (authorized){
        console.log('User has not the right privileges to delete another user');
        req.status(403).send('You do not have the right privileges for such operation');
        return;
    }
    const targetID = req.params.id;
    if (!targetID || targetID == null){
        console.log('Target id missing');
        req.status(400).send('id missing');
        return;
    }
    console.log(`Request for deleting user ${targetID}`);
    const deletion = deleteUserByID(targetID);
    if (deletion){
        console.log(`User of id ${req.params.id} deleted successfully`);
        res.status(200).send(`Member of id ${req.params.id} deleted successfully`);
    } else {
        console.log(`Could not delete user ${req.params.id}`);
        res.status(200).send(`Could not delete user ${req.params.id}`);
    }
}


/**
 * Gets the whole informations about a specific user. A registered user can only get his own data.
 * An admin can get any user's data.
 * @param {*} req 
 * @param {*} res 
 */
const getUser = (req, res) => {
    //verify the privileges level of the demander
    const status = getUserStatus(req.user.id);
    if (status === 'inactive'){
        console.log(`User ${req.user.id} not allowed to request data or another user`);
        res.status(403).send('You do not have the privileges for such request');
        return;
    }
    const role =  getTargetRole(req.user.id);
    if (role === 'admin' || (parseInt(req.params.id) === parseInt(req.user.id)) ){
        const targetID = req.params.id;
        console.log(`Request for getting data of user ${targetID} by user ${req.user.id}`);
        const data = retrieveUser(targetID);
        res.status(200).send(data);
    } else {
        console.log(`User ${req.user.id} not allowed to retrieve data of user ${targetID}`);
        res.status(403).send('You are not allowed to reach this profile');
    }
}

/**
 * Disconnects a user from the API
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const disconnect = (req, res) => {
    //res.cookie('token', '', {expires: new Date(0), path: '/'}); //cookie name = token, value = '', Date(0) = 01/01/1970, path = applied on the whole API (root)
    res.clearCookie('token');
    console.log('User logged out');
    return res.status(200).send('Disconnected')
}

const getUsers = (req, res) => {
    const authorized = requesterIsAdmin(req.user.id);
    if (!authorized){
        console.log('User has not the right privileges for getting another user\'s data');
        res.status(403).send('You do not have the privileges for such request');
    } else {
        console.log(`Request to get all users by user ${req.user.id}`);
        const usersData = getAllUsers();
        res.status(200).send(usersData);
    }
};


/**
 * Updates a user in the database. Both active admin and staff members are allowed to do this BUT
 * only an admin can update another user data. A staff member can only update his own data.
 * In addition to this, only the admin can modifiy the role and the status of anyone. an admin cannot 
 * change his own status (this would be weird)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateUser = (req, res) => {
    const authorized = requesterIsAnyAllowed(req.user.id);
    if (!authorized){
        console.log('User has not the right privileges for update operation');
        res.status(403).send('You do not have the privileges for such operation');
        return;
    }
    if (!req.user.id || req.user.id == null){
        res.status(400).send('Request incomplete');
        return;
    }
    const role = getUserRole(req.user.id);
    // member of the staff trying to update another member
    const targetID = req.params.id;
    // verify that target exists
    const targetExists = findIfUserID(targetID);
    if (!targetExists){
        req.status(400).send('Target not found');
        return;
    }
    let update;
    if (role !== 'admin' && req.user.id != req.params.id){
        console.log(`User ${req.user.id} not allowed to update user ${targetID}`);
        res.status(403).send('You do not have the privileges for such operation');
        return;
    } else if (role === 'staff' && req.user.id === req.params.id){
        console.log(`Request to update user ${targetID} by user ${req.user.id}`);
        update = updateUsr_staff({userID: req.user.id, username: req.body.username, targetID: targetID, password: req.body.password, status: req.body.status, role: req.body.role});
    } else if (role === 'admin'){
        console.log(`Request to update user ${targetID} by user ${req.user.id}`);
        update = updateUsr_admin({userID: req.user.id, username: req.body.username, targetID: targetID, password: req.body.password, status: req.body.status, role: req.body.role});
    }
    if (update){
        console.log('User updated successfully');
        res.status(200).send('User updated successfully');
    } else {
        console.log(`Update of user ${targetID} failed`);
        res.status(400).send('Update failed');
    }
};


module.exports = {
    connect,
    createUser,
    disconnect,
    getUser,
    getUsers,
    deleteUser,
    updateUser,
}