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
            res.status(200).cookie('token', token, { 
                httpOnly: true
            })
            .json({message: 'Authentication successful'}); //{httpOnly: true, secure: true}
        } else {
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
        req.status(403).send('You do not have the right privileges for such operation');
        return;
    }
    const created = newUser(req.body);
    if (created) {
        res.status(200).send('New user successfully created');
    } else {
        res.status(400).send('Failed on creating a new user');
    }

}


/**
 * Removes a user from the database
 * @param {*} req 
 * @param {*} res 
 */
const deleteUser = (req, res) => {
    if (authorized){
        req.status(403).send('You do not have the right privileges for such operation');
        return;
    }
    const targetID = req.params.id;
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
        res.status(403).send('You do not have the privileges for such request');
        return;
    }
    const role =  getTargetRole(req.user.id);
    if (role === 'admin' || (parseInt(req.params.id) === parseInt(req.user.id)) ){
        const userID = req.params.id;
        const data = retrieveUser(userID);
        res.status(200).send(data);
    } else {
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
    return res.status(200).send('Disconnected')
}

const getUsers = (req, res) => {
    const authorized = requesterIsAdmin(req.user.id);
    if (!authorized){
        res.status(403).send('You do not have the privileges for such request');
    } else {
        const usersData = getAllUsers();
        res.status(200).send(usersData);
    }

}


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
        res.status(403).send('You do not have the privileges for such operation');
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
        res.status(403).send('You do not have the privileges for such operation');
        return;
    } else if (role === 'staff' && req.user.id === req.params.id){
        update = updateUsr_staff({userID: req.user.id, username: req.body.username, targetID: targetID, password: req.body.password, status: req.body.status, role: req.body.role});
    } else if (role === 'admin'){
        update = updateUsr_admin({userID: req.user.id, username: req.body.username, targetID: targetID, password: req.body.password, status: req.body.status, role: req.body.role});
    }
    if (update){
        res.status(200).send('User updated successfully');
    } else {
        res.status(400)
    }
}


module.exports = {
    connect,
    createUser,
    disconnect,
    getUser,
    getUsers,
    deleteUser,
    updateUser,
}