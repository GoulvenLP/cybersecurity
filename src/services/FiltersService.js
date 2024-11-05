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
    getFilterContent,
    updateFilter,
    getFiltersTypeID,
} = require('../models/FiltersModels');
const { getUserRole, getUserStatus } = require('../models/ManagersModels');

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


const requesterIsAdmin = (userID) => {
    const role = getUserRole(userID);
    const status = getUserStatus(userID);
    let authorisation = false;
    if (role === 'admin' && status === 'active'){
        authorisation = true;
    }
    return authorisation;
}

const requesterIsAnyAllowed = (userID) => {
    const role = getUserRole(userID);
    const status = getUserStatus(userID);
    let authorisation = false;
    if ((role === 'admin' || role === 'staff') && status === 'active'){
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
        authorized = requesterIsAnyAllowed(userID);
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


/**
 * Updates a filter.
 * The parameter must be of shape: { id, regex, description, typeName, userID }
 * If any field given as a parameter is an empty string, the concerned field will be kept same in the database.
 * @param {*} newFilter 
 * If the filter does not exist, returns false. If the userID is not found, returns false
 * Returns true by default -- this is not the best way to confirm an operation :-(
 */
const updateFlt = (newFilter) => {
    // Verify if the filter exists
    const nb = countFilterID(newFilter.id);
    if (nb === 0){
        return false;
    }
    //get the type corresponding to the typeID. If it does not fit, create a new type
    const currentFilter = getFilterContent(newFilter.id);
    let typeID = null;
    if (newFilter.typeName === "") { //keep the current type
        typeID = getFiltersTypeID(newFilter.id);
    } else { //the type is assigned
        typeID = getIDofType(newFilter.typeName);
        if (!typeID){ //no corresponding type -> create a new type
            typeID = getNextIDType();
            insertNewType({id: typeID, type: newFilter.typeName});
            const nbID = countTypesOfID(typeID);
            if (nbID !== 1){ //failure on type creation
                return false;
            }
        }
    }
    // fill the empty fields of the new filter with the content of the current filter fields
    if (newFilter.regex === '') { newFilter.regex = currentFilter.regex; }
    if (newFilter.description === '') { newFilter.description = currentFilter.description; }
    if (newFilter.typeID === '') { //typeID to use if the current one
        updateFilter({id: newFilter.id, regex: newFilter.regex, description: newFilter.description, typeID: currentFilter.typeID, userID: newFilter.userID});
    } else { //
        updateFilter({id: newFilter.id, regex: newFilter.regex, description: newFilter.description, typeID: typeID, userID: newFilter.userID});
    }
    return true; // <-- smells a bit like bullshit since there is no verification made :-(
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
    requesterIsAdmin,
    requesterIsAnyAllowed,
}