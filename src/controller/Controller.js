const ThreatDetectionService = require("../models/ThreatDetectionServiceModels");

/**
 * Controls if a GET request is suspicious or not
 */
exports.checkUrl = async (req, res) => {
    console.log('GET request');
    const isThreat = await ThreatDetectionService.checkUrl(req.url);
    if(isThreat){
        console.log("Malicious attack detected");
        return res.status(403).json({message: "Threat detected"})
        //KAFKA ?
    } else {
        console.log("No threat detected");
        res.status(200).json({message: "No threat detected"})
    }
}
