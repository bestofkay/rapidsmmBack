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
const morgan = require("morgan");
var cron = require('node-cron');


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

/************ */

cron.schedule('* * * * *', () => {
    Services;
});

(async() => {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/prices/USDT-NGN/spot');
        let nairaAmount = response.data.data.amount;
        console.log(nairaAmount);
    } catch (err) {
        console.log(err.message); //can be console.error
    }
})();

/*************** */
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

/********************** */
//To make express connect as a server and listen to a particular port
app.listen(process.env.URL_PORT, () => {
    console.log(`Back end server is running on PORT ${process.env.URL_PORT}`)
});