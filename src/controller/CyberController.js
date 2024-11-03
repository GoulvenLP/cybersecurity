const {
    createFlt,
    getFlt,
    updateFlt,
    deleteFlt,
 } = require('../services/FiltersService');
 const {
    getUserStatus,
 } = require('../models/ManagersModels')
const ThreatDetectionService = require('../services/ThreatDetectionService');
const IncidentsService = require('../services/IncidentsService');
const { request } = require('express');


/**
 * Controls if a GET request is a threat or not. If it is the case, triggers an incident with specific data.
 */
const checkGETRequest = async (req, res, next) => {
    console.log('Verifying GET content');
    const threatStatus = await ThreatDetectionService.checkUrl(req);
    if(threatStatus.threat === true){
        console.log("Malicious attack detected");
        res.status(403).json({message: "Threat detected"});

        const incident = IncidentsService.createIncident(req, threatStatus.type);
        await IncidentsService.sendIncident(incident.toJSON());

    } else {
        console.log("No threat detected");
        next();
    }
}

/**
 * Creates a new filter from a POST request. Only admins are allowed to create filters
 * @param {*} req 
 * @param {*} res 
 */
 const createFilter = (req, res) => {
    const userID = parseInt(req.user.id);
    const userStatus = getUserStatus(userID);
    //allow only admins to create filters
    if (userStatus === 'staff') {
        res.status(403).send('You don\'t have the right privileges for this operation');
    }
    const request = {userID: userID, regex: req.body.regex, description: req.body.description, type: req.body.type};
    const created = createFlt(request);
    if (created){
        res.status(200).send('New filter created successfully');
    } else {
        res.status(401).send('New filter creation failed');
    }


 };


 /**
  * Retrieves all the filters of the database and their related informations.
  * Both staff members and admins can have access to these informations
  * @param {*} req 
  * @param {*} res 
  */
 const getFilters = (req, res) => {
    const filters = getFlt(req);
    if (filters !== null){
        res.status(200).send(filters);
    } else {
        res.status(403).send("Unauthorized access");
    }
 };

 const updateFilter = (req, res) => {

 };


 /**
  * Deletes a filter from the database. Only an admin can process on such move.
  * @param {*} req
  * @param {*} res 
  */
 const deleteFilter = (req, res) => {
    if (!req.user || !req.user.id){
        res.status(401).send('User not authenticated or ID missing');
        return;
    }
    const requesterID = parseInt(req.user.id);
    const targetID = parseInt(req.params.id);
    if (!targetID){
        res.status(500).send('Argument missing');
        return;
    }
    const userStatus = getUserStatus(requesterID);
    //allow only admins to create filters
    if (userStatus === 'staff') {
        res.status(403).send('You don\'t have the right privileges for this operation');
        return;
    }
    //a user cannot delete himself
    const deleted = deleteFlt(targetID);
    if (deleted) {
        res.status(200).send(`Filter ${targetID} deleted successfully`);
    } else {
        res.status(401).send(`Could not delete filter ${targetID}`);
    }

 }

 module.exports = {
    checkGETRequest,
    createFilter,
    getFilters,
    updateFilter,
    deleteFilter,
 }