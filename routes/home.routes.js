module.exports = function(app) {
	app.get("/", function(req, res) {
		
		if(req.session.user) {
			res.render('home', {
				name: req.session.user.name
			});
		} else {
			res.redirect('/login');
		}
	});
} 