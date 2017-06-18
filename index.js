var express = require("express");
var handlebars  = require('express-handlebars');
var session = require('express-session');
var validator = require('express-validator');
var flash = require('connect-flash');
var bodyParser = require('body-parser')
var cors = require("cors");
var morgan = require("morgan");
var helmet = require("helmet");
var i18n = require("i18n");

var app = express();

/* Sessions */
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

/* Parse post data */
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

/* Post data Validation */
app.use(validator());

/* Send variables in redirect */
app.use(flash());

/* Load Models */
require("./models")(app);

/* Loggin */
app.use(morgan("common"));

/* Security */
app.use(helmet());

/* CORS */
app.use(cors());

/* Static files */
app.use(express.static('public'))

/* Template */
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

/* Localization */
i18n.configure({
    /* locales:['en', 'de'], */
    directory: __dirname + '/locales'
});

app.use(i18n.init);

/* Routes */	
require('./routes/routes')(app);

app.listen(8080, function() {  
    console.log("GroBro server running");
});

module.exports = app;  