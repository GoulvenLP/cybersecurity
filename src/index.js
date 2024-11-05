require('dotenv').config(); //for an access to secret file
const cookieParser = require('cookie-parser');

const express = require('express');
const cyberRoutes = require('./routes/cyberRoutes')
const manageRoutes = require('./routes/manageRoutes');
const {connectProducer, disconnectProducer} = require('./models/IncidentProducerModel');
const { runConsumer } = require('./models/IncidentConsumerModel');
const fs = require('fs');
const Database = require('better-sqlite3');
const {DatabaseManager} = require('./config/db');
//const cors = require('cors'); //TODO: reactivate?

const dbManager = DatabaseManager.getInstance();

const app = express();

// General middlewares for post requests
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//app.use(cors());              //TODO: reactivate?


const startProducer = async () => {
    try {
        await connectProducer();
    } catch (error) {
        console.error('Failed to connect the producer: ', error);
    }
}


// launch consumer
const startConsumer = async () => {
    try {
        //await delay(4000); //2s delay before launching  consumer
        await runConsumer().catch(console.error);
    } catch (error){
        console.log('Failed to connect the consumer')
    }
};


//filter favicon.ico requests
app.use((req, res, next) => {
    if (req.url === '/favicon.ico'){
        res.status(204).end();
    } else {
        next();
    }
});


// Routes
app.use("/manage", manageRoutes);
app.use("/", cyberRoutes);


app.listen(4500, () => {
    console.log("Server listening on port 4500");
});

process.on('SIGINT', async() => {
    await disconnectProducer();
    process.exit(0);
})


//initServer().catch((error) => console.log('Error while initialising server: ', error));
startProducer();
startConsumer();

//var todoList = require('./todolist.js');
//app.use('todolist/', todoList);
module.exports = {
    dbManager,
};
