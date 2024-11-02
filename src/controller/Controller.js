const ThreatDetectionService = require('../services/ThreatDetectionService');
const IncidentsService = require('../services/IncidentsService');
const record = require('../services/ResponseService');


/**
 * Controls if a GET request is a threat or not. If it is the case, triggers an incident with specific data.
 */
exports.checkGETRequest = async (req, res) => {
    console.log('Verifying GET content');
    const threatStatus = await ThreatDetectionService.checkUrl(req);
    if(threatStatus.threat === true){
        console.log("Malicious attack detected");
        res.status(403).json({message: "Threat detected"});     //can be skipped in ulterior versions?

        const incident = IncidentsService.createIncident(req, threatStatus.type);
        await IncidentsService.sendIncident(incident.toJSON());

    } else {
        console.log("No threat detected");
        res.status(200).json({message: "No threat detected"})
    }
}

