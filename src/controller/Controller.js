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
        console.log(incident.toJSON());     //DELETE
        IncidentsService.sendIncident(incident.toJSON());

    } else {
        console.log("No threat detected");
        res.status(200).json({message: "No threat detected"})
    }
}


/**
 * Controls if a POST request is a threat or not. If it is the case, triggers an incident to Kafka
 * @param {*} req 
 * @param {*} res 
 * @returns
 */
exports.checkPOSTRequest = (req, res) => {
    console.log('Verifying POST content');
    const threatStatus1 = ThreatDetectionService.checkUrl(req.url); //verify the url
    const threatStatus2 = ThreatDetectionService.checkBody(req.body); //verify the body's content
    if (threatStatus1.threat === true || threatStatus2.threat === true){
        console.log("Malicious attack detected");
        res.status(403).json({message: "Threat detected"})

        if (threatStatus1.threat){
            const incident = IncidentsService.createIncident(req, threatStatus.type);
            IncidentsService.sendIncident(incident.toJSON());
            record(incident);
        } else if (threatStatus2.threat) {
            const incident = IncidentsService.createIncident(req, threatStatus.type);
            IncidentsService.sendIncident(incident.toJSON());
        }
    } else {
        console.log("No threat detected");
        res.status(200).json({message: "No threat detected"})
    }
}
