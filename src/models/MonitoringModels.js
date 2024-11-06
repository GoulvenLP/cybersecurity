const path = require('path');
const fs = require('fs');


/**
 * Writes any parameter into the log file. The log file is organised so it is
 * antechronological: what is on top is the most recent event.
 * @param {} someEvent 
 */
const registerAction = (someEvent) => {
    const logFilePath = path.join(__basedir, 'logs.txt');
    try {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err){
                console.log('An error occurred, couldn\'t access the log file: ', err);
            } else {
                let logsUpdated = someEvent.concat('\n', data); //invert display
                fs.writeFile(logFilePath, logsUpdated, (err) => {
                    if (err) {
                        console.log('An error occurred, couldn\'t update the log file: ', err);
                    }
                });
            }
        });

    } catch (error) {
        console.error('Log file not found');
    }

}


/**
 * Takes a JSON as a parameter. Discomposes it to display it prettily.
 * Returns the pretty-displayed information as a string
 * @param {} information 
 */
const discomposeInformation = (information) => {
    let discomposedInfo = '['.concat(information.datetime, '] ');
    discomposedInfo = discomposedInfo.concat('[', information.type, '] ');
    discomposedInfo = discomposedInfo.concat('[FROM IP= ', information.origin, '] ');
    discomposedInfo =  discomposedInfo.concat('(CONTENT=', information.description, ')');
    return discomposedInfo;
}


module.exports = {
    discomposeInformation,
    registerAction,
}