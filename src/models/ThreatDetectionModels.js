const db = require('../config/db');

/**
 * Sends a query to the database to retrieve all the regular expressions stored in the database that serve to identify any 
 * malicious attempt and their type.
 * @return: an array of JSON objects with two fields: 'regex_ftr' and 'type_typ'
 */
const getRegularExpressions = () => {
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




module.exports = {
    getRegularExpressions,
}

