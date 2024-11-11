require('dotenv').config(); //for an access to secret file
const cookieParser = require('cookie-parser');
const path = require('path');
global.__basedir = path.join(__dirname, '../'); // define the root project
const express = require('express');
const cyberRoutes = require('./routes/cyberRoutes')
const middlewares = require('./utils/middlewares')
const manageRoutes = require('./routes/manageRoutes');
const cyberController = require('./controller/CyberController');
const managersController = require('./controller/ManagersController');
const {connectProducer, disconnectProducer} = require('./models/IncidentProducerModel');
const { runConsumer } = require('./models/IncidentConsumerModel');
const fs = require('fs');
const {DatabaseManager} = require('./config/db');

const dbManager = DatabaseManager.getInstance();

const app = express();

// General middlewares for post requests
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// launch producer
const startProducer = async () => {
    let connected = false;
    while (!connected){
        try {
            await connectProducer();
            connected = true;
        } catch (error) {
            console.error('Failed to connect the producer: ', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

// launch consumer
const startConsumer = async () => {
    try {
        //await delay(4000); //2s delay before launching  consumer
        await runConsumer().catch(console.error);
    } catch (error){
        console.log('Failed to connect the consumer')
    }
};

//filter favicon.ico requests that may parasite the API
app.use((req, res, next) => {
    if (req.url === '/favicon.ico'){
        res.status(204).end();
    } else {
        next();
    }
});


// Routes & middleware
app.get("/logs", middlewares.authenticateToken, middlewares.checkRequest, cyberController.getLogsController);
app.post("/manage/login", middlewares.checkRequest, managersController.connect); // token not alreay in place
app.use("/manage", middlewares.authenticateToken, middlewares.checkRequest, manageRoutes);
app.use("/filters(/.*)*", middlewares.authenticateToken, middlewares.checkRequest);
app.use("/*", middlewares.checkRequest); // all other requests are just controlled

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
