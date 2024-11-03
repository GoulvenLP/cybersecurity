const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;


// middleware controlilng token authentication
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token){
        return res.sendStatus(401);
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err){
            return res.sendStatus(403); //forbidden
        }
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken,
}