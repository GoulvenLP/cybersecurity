const { getLogs } = require('../services/ThreatDetectionService');
const { countTypesOfID } = require('../models/FiltersModels');
const {
   getUserRole,
   getUserStatus,
} = require('../models/ManagersModels');
const {
    createFlt,
    getFlt,
    updateFlt,
    deleteFlt,
    requesterIsAdmin,
    requesterIsAnyAllowed,
 } = require('../services/FiltersService');


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
    console.log(`Request for creating a new filter by user ${userID}`);
    const created = createFlt(request);
    if (created){
        console.log(`New filter created by user ${userID}`);
        res.status(200).send('New filter created successfully');
    } else {
        console.log(`New filter creation failed for user ${userID}`);
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
    console.log('Request for getting all filters');
    const filters = getFlt(req);
    if (filters !== null){
        console.log('Getting filters succeeded');
        res.status(200).send(filters);
    } else {
        console.log('Unauthorized access');
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
    console.log(`Request for update on filter ${req.params.id} by user ${userID}`);
    const updated = updateFlt({id: req.params.id, regex: req.body.regex, description: req.body.description, typeName: req.body.typeName, userID: req.user.id});
    if (updated){
        console.log('Filter updated successfully');
        res.status(200).send('Filter updated successfully');
    } else {
        console.log('Update on filter failed');
        res.status(400).send('Update on filter failed');
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
    console.log(`Request for deleting filter ${targetID} by user ${requesterID}`);
    const userRole = getUserRole(requesterID);
    //allow only admins to create filters
    if (userRole === 'staff') {
        res.status(403).send('You don\'t have the right privileges for this operation');
        return;
    }
    //a user cannot delete himself
    const deleted = deleteFlt(targetID);
    if (deleted) {
        console.log(`Filter ${targetID} deleted successfully by user ${requesterID}`);
        res.status(200).send(`Filter ${targetID} deleted successfully`);
    } else {
        console.log(`Filter ${targetID} was not deleted`);
        res.status(400).send(`Could not delete filter ${targetID}`);
    }
 }


const getLogsController = (req, res) => {
    const allowed = requesterIsAnyAllowed(req.user.id);
    if (!allowed) {
        console.log(`Request to get logs was not allowed for user ${req.user.id}`);
        res.status(403).send('You do not have the privileges for such request');
        return;
    }
    console.log(`Request to get logs for user of id ${req.user.id}`);
    const logs = getLogs();
    res.status(200).send(logs);
}

 module.exports = {
    createFilter,
    getFilters,
    updateAFilter,
    deleteFilter,
    getLogsController,
 }