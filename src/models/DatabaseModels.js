
/**
 * Generaltes a salt sequence
 * @returns a random 32-characters string as a salt sequence
 */
const generateSalt = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,;:!§/.?ù%*µ$£^=+°@àç_`|()[]{}#~&'
    const characters_length = characters.length;
    let salt = '';
    for(const i=0; i < 32; i++){
        salt = salt.concat(characters.charAt(Math.floor(Math.random() * characters_length)));
    }
    console.log('SALT IS: ', salt);
    return salt;
}


const verifyAuthentication = () => {
    let isVerified = false;
    const verifyUser = 'SELECT id_con, username_con FROM cyb_connect WHERE username_con = ?';

    const verifyAuthentication = 'SELECT'

    return isVerified;
}



module.exports = {
    generateSalt,
    verifyAuthentication,
}