// var express = require('express');
// var router = express.Router();
const db = require('../config/db');


/**
 * Looks for suspicious characters in a GET request
 * returns a boolean: true if a suspicious regex was found, else false
 * @param {} url 
 */
exports.checkUrl = async (url) => {
    url = decodeURIComponent(url);
    const isThreat = await checkIfInjection(url);
    return isThreat;
};


/**
 * Sends a query to the database to retrieve all the regular expressions stored in the database that serve to identify any 
 * malicious attempt and their type.
 * @return: an array of JSON objects with two fields: 'regex_ftr' and 'type_typ'
 */
const regularExpressions = () => {
    // request that gets all regular expression stored in the db and their types
    const sql = "SELECT regex_ftr, type_typ FROM cyb_filters JOIN cyb_types USING (id_typ) ORDER BY type_typ ASC;";
    return new Promise ((resolve, reject) => {
        db.query(sql, (err, results) =>  {
            if(err) {
                console.log('Error while trying to retrieve regular expressions: ', err);
                results.status(500).json({ error: 'Server error' });
                return;
            }
            resolve(results);
        });
    });
};


/**
 * Tests different patterns on an url given as a parameter, to verify if they both
 *  match. A pattern corresponds to a filter to detect malicious attacks
 * @param {} url : url sent by a user.
 * @returns true if they match, else false.
 */
const checkIfInjection = async (url) => {
    //injection of script or image
    let isThreat = false;
    const patterns = await regularExpressions();
    patterns.forEach(pattern => {
        const p = new RegExp(pattern.regex_ftr, "gi");
        if(url.match(p)){
            isThreat = true;
            return; //threat detected
        }
    });
    return isThreat;
};

