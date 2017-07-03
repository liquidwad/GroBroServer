var express = require("express");
var express_handlebars  = require('express-handlebars');
var express_handlebars_sections = require('express-handlebars-sections');
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
var sharedSession = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
});

app.use(sharedSession);

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
//app.use(helmet());

/* CORS */
//app.use(cors());

/* Static files */
app.use(express.static('public'))

/* Template */
/*app.engine('handlebars', handlebars({
  defaultLayout: 'main', 
  section: handlebars_sections() 
}));*/

var hbs = express_handlebars.create({
  defaultLayout: 'main'
});

express_handlebars_sections(hbs);   // CONFIGURE 'express_handlebars_sections' 
 
app.engine('handlebars', hbs.engine);

app.set('view engine', 'handlebars');

/* Localization */
i18n.configure({
    /* locales:['en', 'de'], */
    directory: __dirname + '/locales'
});

app.use(i18n.init);

/* Routes */	
require('./routes/routes')(app);

/* SocketIO */

var server = require('http').Server(app);

/* Setup caching */
var cache = require('persistent-cache');

app.cache = cache();

/* Setup socketIO server with models and sessions */
require('./state')(app, server, sharedSession, app.orm_middleware);

server.listen(8080, function() {  
    console.log("GroBro server running");
});


/*app.listen(8080, function() {  
    console.log("GroBro server running");
});*/