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
            let message = 'The CORS policy for this application doesnt allow access from origin ' + origin;
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

console.log('MongoDB Connection URI:', process.env.CONNECT_URI);

mongoose.connect('mongodb+srv://kt23:Gelatoniwing%4023@movie.eykysra.mongodb.net/movie_api?retryWrites=true&w=majority', { 
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
    await movies.findOne({ Title: req.params.title})
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
    check('Username', 'username is required!').isLength({min: 3}),
    check('Username', 'username contains non alphanumericcharacters - not allowed.').isAlphanumeric(),
    check('Email', 'email does not appear to be valid').isEmail(),
    ], async (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array()});
        }

        let hashedPassword = users.hashPassword(req.body.Password);
            await users.findOne({ Username: req.body.Username})
            .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
                users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
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
  
    await users.findOneAndUpdate({ Username: req.params.username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
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
    
    await users.findOneAndDelete({Username: req.params.username})
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

// CREATE
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { username, movieId } = req.params;

    try {
        const updatedUser = await users.findOneAndUpdate(
            { Username: username }, 
            { $push: { FavoriteMovies: movieId } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


// DELETE
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { username, movieId } = req.params;

    try {
        const updatedUser = await users.findOneAndUpdate(
            { Username: username }, 
            { $pull: { FavoriteMovies: movieId } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).send(`User ${username} not found.`);
        }

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
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

