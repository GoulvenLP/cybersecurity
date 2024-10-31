const path = require('path');
const fs = require('fs');


/**
 * Writes any parameter into the log file. The log file is organised so it is
 * antechronological: what is on top is the most recent event.
 * @param {} someEvent 
 */
const registerAction = (someEvent) => {
    const logFilePath = path.join(__dirname, 'logs.txt');
    fs.readFile(path.join(__dirname, '../../logs.txt'), 'utf8', (err, data) => {
        if (err){
            console.log('An error occurred, couldn\'t access the log file: ', err);
        } else {
            logsUpdated = newLog.concat(data);
            fs.writeFile(logFilePath, logsUpdated, (err) => {
                console.log('An error occurred, couldn\'t update the log file: ', err);
            });
        }
    });

}


/**
 * Takes a JSON as a parameter. Discomposes it to display it prettily.
 * Returns the pretty-displayed information as a string
 * @param {} information 
 */
const discomposeInformation = (information) => {
    let discomposedInformation = information.datetime;
    discomposeInformation.concat(' [', information.type, '] ');
    discomposeInformation.concat(information.description, ' from ');
    discomposeInformation.concat(information.origin);
    return discomposedInformation;
}


module.exports = {
    registerAction,
    discomposeInformation,
}