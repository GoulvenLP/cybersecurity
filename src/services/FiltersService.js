const {
    getAllFilters,
    getNextIDFilter,
    countFilterID,
    getNextIDType,
    getIDofType,
    insertNewType,
    insertNewFilter,
    countTypesOfID,
    removeFilter, 
} = require('../models/FiltersModels');
const { getUserStatus } = require('../models/ManagersModels');

/**
 * Adds a filter to the database
 * The creation of a filter must contain 4 parameters: 
 * - the creator's id, 
 * - the regular expression corresponding ot the filter
 * - a description of the filter (this field can be empty)
 * - a type whose regular expression is bound
 * @param {*} userid 
 * @param {*} f 
 */
const createFlt = (newf) => {
    let typeID = getIDofType(newf.type);
    const userID = newf.userID;
    //type does not exist in the DB -> create it
    if (!typeID) {
        typeID = getNextIDType();
        insertNewType({id: typeID, type: newf.type});
        const nbID = countTypesOfID(typeID);
        if (nbID !== 1){
            return false;
        }
    }
    //create filter
    const nextID = getNextIDFilter();
    const newFilter = {id: nextID, regex: newf.regex, description: newf.description, typeID: typeID, userID: userID};
    insertNewFilter(newFilter);
    //verify that the filter was successfully created
    const found = countFilterID(nextID);
    return found == 1;
};


const authorizedRequester = (userID) => {
    const status = getUserStatus(userID);
    let authorisation = false;
    if (status === 'admin' || status === 'staff'){
        authorisation = true;
    }
    return authorisation;
}

/**
 * Gets all filters if and only if the user is connected and part of the database,
 * whether admin or staff                                                                   //verify if account activated?
 * @param {*} req 
 * @returns 
 */
const getFlt = (req) => {
    let authorized = null;
    if (req.user && req.user.id){
        const userID = req.user.id;
        authorized = authorizedRequester(userID);
    } else {
        return null;
    }
    if (authorized){
        const allFilters = getAllFilters();
        return allFilters;
    } else {
        return null;
    }
};


const updateFlt = (newFilter) => {
    const toto = null;
}


/**
 * Deletes a filter from the database.
 * Controls that the filter to delete exists
 * Controls that the filter got deleted after command
 * @param {} filterID 
 * @returns true if the deletion worked, else false
 */
const deleteFlt = (filterID) => {
    let number = countFilterID(filterID);
    if (number == 0){
        return false;
    }
    removeFilter(filterID);
    number = countFilterID(filterID);
    return number == 0;
}


module.exports = {
    createFlt,
    getFlt,
    updateFlt,
    deleteFlt,
}