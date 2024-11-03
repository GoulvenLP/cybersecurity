const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { 
    newUser,
    retrieveUser,
    findUserID,
    deleteUserByID,
    verifyAuthentication,
    getUserID,
    getTargetStatus,
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
 * Creates a new user in the database
 * @param {*} req 
 * @param {*} res 
 */
const createUser = (req, res) => {
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
    const userID = req.params.id;
    const deletion = deleteUserByID(userID);
    if (deletion){
        console.log(`User of id ${req.params.id} deleted successfully`);
        res.status(200).send(`Member of id ${req.params.id} deleted successfully`);
    } else {
        console.log(`Could not delete user ${req.params.id}`);
        res.status(200).send(`Could not delete user ${req.params.id}`);
    }
}


/**
 * Gets the whole informations about a specific user
 * @param {*} req 
 * @param {*} res 
 */
const getUser = (req, res) => {
    //verify the privileges level of the demander
    const status = getTargetStatus(req.user.id);
    if (status === 'admin' || (parseInt(req.params.id) === parseInt(req.user.id)) ){
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




module.exports = {
    connect,
    createUser,
    disconnect,
    getUser,
    deleteUser,
}