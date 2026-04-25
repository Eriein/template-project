require('dotenv').config();
const SERVER_PORT = 8081


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
const movieGluRoutes = require("./routes/movieGluRoutes");
const flashcardRouter = require("./routes/flashcardRoute");
//Import of completion time routes
const completionTimeCreate = require('./routes/completionTimeCreate')
const completionTimeRead = require('./routes/completionTimeRead')
const completionTimeUpdate = require('./routes/completionTimeUpdate')
const completionTimeDelete = require('./routes/completionTimeDelete')
const createAIReview = require('./routes/createAIReview');
const getAIReviews = require('./routes/getAIReviews');
const deleteAIReview = require('./routes/deleteAIReview');
const getUserScore = require("./routes/getUserScore");
const userSetZipCode = require("./routes/userSetZipCode");
const userGetAllZipCodes = require("./routes/userGetAllZipCodes");
const plotSummaryRoute = require('./routes/plotSummary');
const movieSearchRoute = require('./routes/movieSearch');
const movieTopRatedRoute = require('./routes/movieTopRated');
const favoriteRoutes = require('./routes/favoriteRoutes');
const movieChatRoute = require('./routes/movieChat');



dbConnection()
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)
app.use('/completion-times', completionTimeCreate)
app.use('/completion-times', completionTimeRead)
app.use('/completion-times', completionTimeUpdate)
app.use('/completion-times', completionTimeDelete)
app.use('/user', createAIReview)
app.use('/user', getAIReviews)
app.use('/user', deleteAIReview)
app.use("/scores", getUserScore);
app.use('/user', userSetZipCode);
app.use('/user', userGetAllZipCodes);
app.use("/movieglu", movieGluRoutes);
app.use("/api/flashcards", flashcardRouter);

app.use('/movies', plotSummaryRoute);
app.use('/movies', movieSearchRoute);
app.use('/movies', movieTopRatedRoute);
app.use('/favorites', favoriteRoutes);
app.use('/movies', movieChatRoute);


app.listen(SERVER_PORT, (req, res) => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
})


