const jwt = require('jsonwebtoken');
const ThreatDetectionService = require('../services/ThreatDetectionService');
const incidentsService = require('../services/IncidentsService');
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


/**
 * Controls if a GET request is a threat or not. If it is the case, triggers an incident with specific data.
 */
const checkRequest = async (req, res, next) => {
    console.log('Verifying the integrity of the request');
    const threatInUrl = ThreatDetectionService.checkUrl(req);
    let threatInBody = {threat: false, type: null };
    if (req.body){ // presence of a body
        threatInBody = ThreatDetectionService.checkBody(req.body);
        if (!threatInBody || !(threatInBody.hasOwnProperty('threat'))){
            threatInBody = {threat: false, type: null};
        }
    }
    // check the url
    if(threatInUrl.threat || threatInBody.threat){
        console.log("Malicious attack detected");
        res.status(400).json({message: "Threat detected"});
        //GET REQUEST
        if (threatInUrl.threat){
            const incident = incidentsService.createIncident(req, threatInUrl.type);
            await incidentsService.sendIncident(incident.toJSON());
        } else {
            const incident = incidentsService.createIncident(req, threatInBody.type);
            await incidentsService.sendIncident(incident.toJSON());
        }

    } else {
        console.log("No threat detected");
        next();
    }
}

module.exports = {
    authenticateToken,
    checkRequest,
}