const express = require("express");
//Mongoose
const mongoose = require("mongoose");
//DOTENV
const dotenv = require("dotenv");
//use userRoutes
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const fetchRoute = require("./routes/fetchService");
const coinRoute = require("./routes/coin");
const orderRoute = require("./routes/order")
const walletRoute = require("./routes/wallet");
const productRoute = require("./routes/product");
const fundRoute = require("./routes/fund");
const morgan = require("morgan");
const runCron = require("./library/cron");


//HTTPs REQUESTS
const axios = require('axios').default;
const cors = require("cors");
//To Use express, insrt in a constant variable called app
const app = express();


//Instatiate dotenv
dotenv.config();

//connect to Mongoose DB
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB connected successfully"))
    .catch((err) => {
        console.log(err)
    });

runCron();
/****************MIDDLEWARE */
app.use(morgan('tiny'))
    /***************END POINTS */
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/fetch', fetchRoute);
app.use('/api/coin', coinRoute);
app.use('/api/order', orderRoute);
app.use('/api/wallet', walletRoute);
app.use('/api/fund', fundRoute);
app.use('/api/product', productRoute);

/********************** */
//To make express connect as a server and listen to a particular port
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Back end server is running on PORT ${PORT}`)
});