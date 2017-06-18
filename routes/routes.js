
module.exports = function(app) {
	require('./home.routes')(app);
	require('./users.routes')(app);
}