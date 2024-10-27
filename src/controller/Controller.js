const ThreatDetectionService = require("../services/ThreatDetectionService");

/**
 * Controls if a GET request is a threat or not
 */
exports.checkGETRequest = async (req, res) => {
    console.log('Verifying GET content');
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


/**
 * Controls if a POST request is a threat or not
 * @param {*} req 
 * @param {*} res 
 * @returns
 */
exports.checkPOSTRequest = async (req, res) => {
    console.log('Verifying POST content');
    const isThreat1 = await ThreatDetectionService.checkUrl(req.url); //verify the url
    const isThreat2 = await ThreatDetectionService.checkBody(req.body); //verify the body's content
    if (isThreat1 || isThreat2){
        console.log("Malicious attack detected");
        return res.status(403).json({message: "Threat detected"})
    } else {
        console.log("No threat detected");
        res.status(200).json({message: "No threat detected"})
    }
}
