const {
    createFlt,
    getFlt,
    updateFlt,
    deleteFlt,
    requesterIsAdmin,
 } = require('../services/FiltersService');
 const {
    getUserRole,
    getUserStatus,
 } = require('../models/ManagersModels')
const ThreatDetectionService = require('../services/ThreatDetectionService');
const IncidentsService = require('../services/IncidentsService');
const { countTypesOfID } = require('../models/FiltersModels');


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
 * Creates a new filter from a POST request. Only active admins are allowed to create filters
 * @param {*} req 
 * @param {*} res 
 */
 const createFilter = (req, res) => {
    const userID = parseInt(req.user.id);
    const authorized = requesterIsAdmin(userID)
    if (!authorized) {
        res.status(403).send('You don\'t have the right privileges for this operation');
        return;
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
  * Both staff members and admins can have access to these informations but their account must be active
  * @param {*} req 
  * @param {*} res 
  */
 const getFilters = (req, res) => {
    const status = getUserStatus(req.user.id);
    if (status === 'inactive'){
        res.status(403).send('You do not have the privileges to access this request');
        return;
    }
    const filters = getFlt(req);
    if (filters !== null){
        res.status(200).send(filters);
    } else {
        res.status(403).send("Unauthorized access");
    }
 };

 /**
  * Updates a filter. Only an active admin can proceed such operation.
  * the update must be introduced into such object: { id, regex, description, typeName }
  * @param {*} req 
  * @param {*} res 
  * @returns 
  */
 const updateAFilter = (req, res) => {
    const authorized = requesterIsAdmin(req.user.id);
    if (!authorized){
        res.status(403).send('You do not have the privileges for this operation');
        return;
    }
    const nbOccurrencesType = countTypesOfID(req.params.id);
    if (nbOccurrencesType === 0){
        res.status(401).send('Filter to update not found');
        return;
    }
    const updated = updateFlt({id: req.params.id, regex: req.body.regex, description: req.body.description, typeName: req.body.typeName, userID: req.user.id});
    if (updated){
        res.status(200).send('Filter updated successfully');
    } else {
        res.status(401).send('Update on filter failed');
    }

 };


 /**
  * Deletes a filter from the database. Only an active admin can process on such move.
  * @param {*} req
  * @param {*} res 
  */
 const deleteFilter = (req, res) => {
    const authorized = requesterIsAdmin(req.user.id);
    if (!authorized){
        res.status(403).send('You do not have the privileges for this operation');
        return;
    }
    const requesterID = parseInt(req.user.id);
    const targetID = parseInt(req.params.id);
    if (!targetID){
        res.status(500).send('Argument missing');
        return;
    }
    const userRole = getUserRole(requesterID);
    //allow only admins to create filters
    if (userRole === 'staff') {
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
    updateAFilter,
    deleteFilter,
 }