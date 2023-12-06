const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const { check, validationResult } = require('express-validator');

let allowedOrigins = ['http://localhost:8080'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth.js') (app);

const passport = require('passport');
    require('./passport.js');

app.use(morgan('common'));

const Models = require('./models.js');
const movies = Models.movie;
const users = Models.user;


mongoose.connect('process.env.CONNECT_URI', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
});

app.get('/', (req, res) => {
    res.send('Welcome to MyMovies!');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
        await users.find()
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
        await users.findOne({ username: req.params.username })
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await movies.findOne({ title: req.params.title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await movies.findOne({ name: req.params.genreName})
        .then((movies) => {
            res.json(movies.genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await movies.findOne({ 'director.name': req.params.directorName})
        .then((movie) => {
            res.json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.post('/users', [
    check('username', 'username is required!').isLength({min: 3}),
    check('username', 'username contains non alphanumericcharacters - not allowed.').isAlphanumeric(),
    check('email', 'email does not appear to be valid').isEmail(),
    ], async (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array()});
        }

        let hashedPassword = users.hashPassword(req.body.password);
            await users.findOne({ username: req.body.username})
            .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
                users.create({
                    username: req.body.username,
                    password: hashedPassword,
                    email: req.body.email,
                    birthday: req.body.birthday
                    })
                    .then((user) => {
                        res.status(201).json(user)
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
        }
    })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
   if(req.user.username !== req.params.username){
        return res.status(400).send('Permission denied');
   }
    await users.findOneAndUpdate({ username: req.params.username }, {
        $set:
        {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday,
        }
    },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});

app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.username !== req.params.username){
        return res.status(400).send('Permission denied');
    }
    await users.findOneAndDelete({username: req.params.username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
            })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
    });
});

//CREATE
app.post('/users/:id/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.username !== req.params.id){
        return res.status(400).send('Permission denied');
    }

    await users.findOneAndUpdate({ username: req.params.id}, {
        $push: { favoriteMovies: req.params.id }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//DELETE
app.delete('/users/:username/movies/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.username !== req.params.id) {
        return res.status(400).send('Permission denied');
    }
    await users.findOneAndUpdate({ username: req.params.id }, {
        $pull: { favoriteMovies: req.params.id }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

