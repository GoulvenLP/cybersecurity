const ThreatDetectionModels = require('../models/ThreatDetectionModels');
const {InjectionStatus} = require('../models/Incident');

/**
 * Looks for suspicious patterns in a GET request
 * returns an InjectionStatus object
 * @param {} url 
 */
const checkUrl = async (req) => {
    const url = decodeURIComponent(req.url);
    const threatStatus = await checkIfInjection(url);
    return threatStatus;
};


/**
 * Looks for suspicious patterns in the object transmitted through a POST request
 * @param {*} jsonObj a JSON object.
 * @returns true if a suspicious regular expression was found, else false.
 */
const checkBody = async (jsonObj) => {
    for (const field of Object.keys(jsonObj)){
        const fieldValue = jsonObj[field] ? jsonObj[field].toString() : ""; 
        const threatStatus = await checkIfInjection(fieldValue);
        if (threatStatus.threat === true){
            return new InjectionStatus(true, isThreat);
        }
    }
    return threatStatus;
}


/**
 * Tests different patterns on a given string, to verify if they both
 *  match. A pattern corresponds to a filter to detect malicious attacks
 * @param {} stringValue : a string sent by a user.
 * @returns an InjectionStatus object.
 */
const checkIfInjection = (stringValue) => {
    const patterns = ThreatDetectionModels.getRegularExpressions();
    for (const pattern of patterns){

        const p = new RegExp(pattern.regex_ftr, "gi");
        if(stringValue.match(p)){
            return new InjectionStatus(true, pattern.type_typ);
        }
    }
    return new InjectionStatus(false, null);
};


// exported modules
module.exports = {
    checkUrl,
    checkBody,
};