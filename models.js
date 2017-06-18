var orm = require('orm');

module.exports = function(app) {
	app.use(orm.express("mysql://root:@localhost/grobro", {
		define: function(db, models, next) {

			models.User = db.define('users', {
				id: { type: 'serial', key: true },
				name: { type: "text", size: 64 },
				email: { type: "text", size: 64 },
				password: String,
				key_id: { type: "integer" }
			});

			models.Key = db.define('keys', {
				id: { type: 'serial', key: true },
				key: String
			});

			db.sync(function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log("Tables have been synced");
				}
			});

			console.log("Models created");

			next();
		}
	}));
};