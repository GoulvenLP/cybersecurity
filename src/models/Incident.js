
class Incident {
    
    constructor(datetime, type, description, origin){
        this.datetime = datetime;
        this.type = type;
        this.description = description;
        this.origin = origin; //ip of the sender
    }

    toJSON(){
        return {
            datetime: this.datetime,
            type: this.type,
            description: this.description,
            origin: this.origin,
        }
    }
}


/*----------------------------------------------------- */

class Get {
    constructor(url){
        this.url = url;
    }

    toJSON(){
        return {
            url: this.url
        }
    }
}


/*----------------------------------------------------- */

class InjectionStatus {
    constructor(status, type){
        this.threat = status;
        this.type = type;
    }

    toJSON(){
        return {
            threat: this.threat,
            type: this.type
        }
    }
}


module.exports = {
    Incident,
    Get,
    InjectionStatus,
}