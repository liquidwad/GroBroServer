var passwordHash = require('password-hash');

module.exports = function(app) {

	function logincheck(req, res, next) {
		if(req.session.user) {
			res.redirect('/')
			return;
		}

		next();
	}

	app.get("/login", logincheck, function(req, res) {
		res.render('login', { 
			isLogin: true, 
			title: "Login",
			body: req.flash('body')[0],
			error: req.flash('error')
		});
	});

	app.post("/login", function(req, res) {
		req.checkBody('email', res.__('Invalid email.')).notEmpty().isEmail();
		req.checkBody('password', res.__('Password requires 8 to 16 characters.')).notEmpty().len(8, 16);

		req.getValidationResult().then(function(result) {
			if(!result.isEmpty()) {
				req.flash('error', res.__('Incorrect username or password.'));
				req.flash('body', req.body);
				res.redirect('/login');
				return;
			}

			req.models.User.find({ email: req.body.email }, function(err, users) {
				if(err || users.length == 0) {
					req.flash('error', res.__("No account exist's for this user"));
					req.flash('body', req.body);
					res.redirect('/login');
					return;
				}

				if(passwordHash.verify(req.body.password, users[0].password)) {
					req.session.user = users[0];
					res.redirect('/');
				}
				else {
					req.flash('error', res.__('Incorrect username or password.'));
					req.flash('body', req.body);
					res.redirect('/login');
				}
			});
		})
	});

	app.get("/register", logincheck, function(req, res) {
		res.render('register', { 
			isLogin: true, 
			title: "Register",
			body: req.flash('body')[0],
			error: req.flash('error'),
			error_collection: req.flash('error_collection')
		});
	});

	app.post("/register", function(req, res) {
		req.checkBody('device_key', res.__('Invalid key.')).notEmpty().len(20, 100);
		req.checkBody('email', res.__('Invalid email.')).notEmpty().isEmail();
		req.checkBody('password', res.__('Password requires 8 to 16 characters.')).notEmpty().len(8, 16);
		req.checkBody('name', res.__('Name requires minimal 3 characters.')).notEmpty().len(3, 50);

		req.getValidationResult().then(function(result) {

			/* Check if everything is valid */
			if(!result.isEmpty()) {
				req.flash('error_collection', result.array());
				req.flash('body', req.body);
				res.redirect("/register");
				return;
			}

			/* Check if key exists in database */
			req.models.Key.find({ key: req.body.device_key }, function(err, keys) {
				if(err || keys.length == 0) {
					req.flash('error', res.__("Invalid key, please try again."));
					req.flash('body', req.body);
					res.redirect("/register");
					return;
				}

				/* Everything is correct now create account */
				var user = { 
					name: req.body.name,
					email: req.body.email,
					password: passwordHash.generate(req.body.password),
					key_id: keys[0].id
				};

				req.models.User.create(user, function(err, results) {
					if(err) {
						req.flash('error', res.__(err));
						res.redirect("/register");
						return;
					}

					/* Setup session and redirect */
					req.session.user = results;
					res.redirect('/');
				});
			});
		});
	});
}