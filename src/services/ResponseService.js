const { discomposeInformation, registerAction } = require("../models/MonitoringModels")


/**
 * Method that adds a log to the log file
 * @param {} data a JSON object
 */
const record = (data) => {
    aLog = discomposeInformation(data);
    registerAction(aLog);


}

module.exports = {
    record,
}