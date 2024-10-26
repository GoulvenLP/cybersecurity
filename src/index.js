const express = require('express');
const cyberRoutes = require('./routes/cyberRoutes')

//const cors = require('cors'); //TODO: reactivate?
const app = express();
//const todosRoutes = require('./src/routes/todosRoutes');


// General middlewares for post requests
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(cors());              //TODO: reactivate?

// Routes
app.use("/", cyberRoutes);
// app.use("/tasks", todosRoutes);
// app.use("/tasks/pending", todosRoutes);
// app.use("/tasks/([0-9]+)", todosRoutes); //update && delete

app.all("/(.*)", (req, res) => {
    app.use("/toto", cyberRoutes)
})


app.listen(4500, () => {
    console.log("Server listening on port 4500");
});

//var todoList = require('./todolist.js');
//app.use('todolist/', todoList);