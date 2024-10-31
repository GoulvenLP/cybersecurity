const express = require('express');
const cyberRoutes = require('./routes/cyberRoutes')
const {connectProducer} = require('./models/IncidentProducerModel');
const fs = require('fs');
const Database = require('better-sqlite3');
const {DatabaseManager} = require('./config/db');
//const cors = require('cors'); //TODO: reactivate?


const dbManager = DatabaseManager.getInstance();
console.log('DB IS: ', dbManager);
//dbManager.initializeDB();

const app = express();
//const todosRoutes = require('./src/routes/todosRoutes');


// General middlewares for post requests
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(cors());              //TODO: reactivate?

// launch producer
const startApp = async () => {
    try {
        await connectProducer();
    } catch (error){
        console.log('Failed to connect the producer')
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
app.use("/", cyberRoutes);
// app.use("/tasks", todosRoutes);
// app.use("/tasks/pending", todosRoutes);
// app.use("/tasks/([0-9]+)", todosRoutes); //update && delete


app.listen(4500, () => {
    console.log("Server listening on port 4500");
});


//initServer().catch((error) => console.log('Error while initialising server: ', error));
startApp();

//var todoList = require('./todolist.js');
//app.use('todolist/', todoList);
module.exports = {
    dbManager,
};