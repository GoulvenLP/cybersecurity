const ThreatDetectionModels = require('../models/ThreatDetectionModels');

/**
 * Looks for suspicious patterns in a GET request
 * returns a boolean: true if a suspicious regex was found, else false
 * @param {} url 
 */
const checkUrl = async (url) => {
    url = decodeURIComponent(url);
    const isThreat = await checkIfInjection(url);
    return isThreat;
};


/**
 * Looks for suspicious patterns in the object transmitted through a POST request
 * @param {*} jsonObj a JSON object.
 * @returns true if a suspicious regular expression was found, else false.
 */
const checkBody = async (jsonObj) => {
    let isThreat = false;
    for (const field of Object.keys(jsonObj)){
        const fieldValue = jsonObj[field] ? jsonObj[field].toString() : ""; 
        isThreat = await checkIfInjection(fieldValue);
        if (isThreat){
            return isThreat;
        }
    }
    return isThreat;
}


/**
 * Tests different patterns on a given string, to verify if they both
 *  match. A pattern corresponds to a filter to detect malicious attacks
 * @param {} stringValue : a string sent by a user.
 * @returns true if they match, else false.
 */
const checkIfInjection = async (stringValue) => {
    let isThreat = false;
    const patterns = await ThreatDetectionModels.getRegularExpressions();
    for (pattern of patterns){
        const p = new RegExp(pattern.regex_ftr, "gi");
        if(stringValue.match(p)){
            return true;
        }
    }
    return isThreat;
};


// exported modules
module.exports = {
    checkUrl,
    checkBody,
};