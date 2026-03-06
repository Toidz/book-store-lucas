const express = require("express");
require('dotenv').config()
const path = require("path");
const app = express();
const port = process.env.PORT || 3033;
const cookieParser = require("cookie-parser");

const database = require("./config/database");
database.connect();

const flash = require('express-flash');
const session = require('express-session');


app.use(cookieParser("SFGWHSDSGSDSD"));
// Nhúng Flash
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());

app.set("views",path.join(__dirname,"views"));
app.set("view engine","pug");
app.use(express.static(path.join(__dirname,"public")));

const variableConfig = require("./config/variable");
app.locals.pathAdmin = variableConfig.pathAdmin;
global.pathAdmin = variableConfig.pathAdmin;

app.use(express.json());

const clientRouter= require("./router/client/index.route")
app.use("/",clientRouter);
const adminRouter= require("./router/admin/index.route")
app.use(`/${variableConfig.pathAdmin}`,adminRouter);

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});