const { Incident, Get } = require("../models/Incident");
const {connectProducer, sendToProducer} = require('../models/IncidentProducerModel');

/**
 * Creates an Incident object from parameters extracted from the original request, 
 * the type of incident that was identified and the current datetime
 * @param {} req : the original request
 * @param {*} typeOfAttack the field type_typ of the corresponding identified attack in the database
 * @returns a new Incident object
 */
const createIncident = (req, typeOfAttack) => {
    const datetime = new Date().toLocaleString('fr-FR', { timeZone: 'CET' });
    const type = typeOfAttack;
    const url = req.url;
    const ip = req.ip;
    return new Incident(datetime, type, url, ip);
}


/**
 * Sends an incident to Kafka
 * @param {} incident 
 */
const sendIncident = async (incident) => {
    await sendToProducer(incident);
};



module.exports = {
    createIncident,
    sendIncident,
};