const express = require("express");
const app = express();
const cors = require('cors')
const loginRoute = require('./routes/userLogin')
const getAllUsersRoute = require('./routes/userGetAllUsers')
const registerRoute = require('./routes/userSignUp')
const getUserByIdRoute = require('./routes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userEditUser')
const deleteUser = require('./routes/userDeleteAll')
//Import of completion time routes
const completionTimeCreate = require('./routes/completionTimeCreate')
const completionTimeRead = require('./routes/completionTimeRead')
const completionTimeUpdate = require('./routes/completionTimeUpdate')
const completionTimeDelete = require('./routes/completionTimeDelete')
const createAIReview = require('./routes/createAIReview');
const getAIReviews = require('./routes/getAIReviews');
const userSetZipCode = require("./routes/userSetZipCode");
const userGetAllZipCodes = require("./routes/userGetAllZipCodes");

require('dotenv').config();
const SERVER_PORT = 8081

dbConnection()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)
app.use(require("./routes/userSetZipCode"));
app.use(require("./routes/userGetAllZipCodes"));
//app.use for completion time
app.use('/completion-times', completionTimeCreate)
app.use('/completion-times', completionTimeRead)
app.use('/completion-times', completionTimeUpdate)
app.use('/completion-times', completionTimeDelete)
app.use('/user', createAIReview)
app.use('/user', getAIReviews)
app.use('/user', userSetZipCode);
app.use('/user', userGetAllZipCodes);


app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})
