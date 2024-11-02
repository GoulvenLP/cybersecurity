const { discomposeInformation, registerAction } = require("../models/MonitoringModels")


/**
 * Method that adds a log to the log file
 * @param {} data a JSON object
 */
const manage = (message) => {
    if (!message){
        console.log('Invalid incident: ', message);
    }
    const prettyMessage = discomposeInformation(JSON.parse(message));
    registerAction(prettyMessage);
}

module.exports = {
    manage,
}