const ThreatDetectionModels = require('../models/ThreatDetectionModels');

/**
 * Looks for suspicious patterns in a GET request
 * returns an InjectionStatus object
 * @param {} url 
 */
const checkUrl = async (req) => {
    const url = decodeURIComponent(req.url);
    const threatStatus = checkIfInjection(url);
    return threatStatus;
};


/**
 * Looks for suspicious patterns in the object transmitted through a POST request
 * @param {*} jsonObj a JSON object.
 * @returns true if a suspicious regular expression was found, else false.
 */
const checkBody = (jsonObj) => {
    let threatStatus;
    for (const field of Object.keys(jsonObj)){
        const fieldValue = jsonObj[field] ? jsonObj[field].toString() : ""; 
        threatStatus = checkIfInjection(fieldValue);
        if (threatStatus.threat === true){
            return threatStatus
        }
    }
    return threatStatus;
}


/**
 * Tests different patterns on a given string, to verify if they both
 *  match. A pattern corresponds to a filter to detect malicious attacks
 * @param {} stringValue : a string sent by a user.
 * @returns a JSON object containing a status on the threat: if it is true there is 
 * a threat, otherwise not; and the type of threat.
 * If there was no threat detected, this field is null.
 */
const checkIfInjection = (stringValue) => {
    const patterns = ThreatDetectionModels.getRegularExpressions();
    for (const pattern of patterns){
        const p = new RegExp(pattern.regex, "gi");
        if(stringValue.match(p)){
            return { threat: true, type: pattern.type };
        }
    }
    return { attack: false, type: null };
};


/**
 * Gets and returns all logs from the log file.
 * Only an activated user can access the logs
 * @returns a string.
 */
const getLogs = () => {
    const logs = ThreatDetectionModels.getAllLogs();
    return logs;
}


// exported modules
module.exports = {
    checkUrl,
    checkBody,
    getLogs,
};