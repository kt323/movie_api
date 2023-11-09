const express = require('express');
const port = 8080
    bodyParser = require('body-parser');
    uuid = require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const movies = Models.movie;
const users = Models.user;
const genres = Models.genre;
const directors = Models.director;

mongoose.connect('mongodb://localhost:27017/cdDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
});

app.use(bodyParser.json());

app.use(morgan('common'));


app.get('/', (req, res) => {
    res.send('Welcome to MyMovies!');
});

app.get('/movies', (req, res) => {
    movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

    app.get('/users', function (req, res) {
        users.find()
            .then(function (users) {
                res.status(201).json(users);
            })
            .catch(function (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    
app.get('/movies/:title', (req, res) => {
    movies.findOne({ title: req.params.title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/genres/:name', (req, res) => {
    genres.findOne({ name: req.params.name})
        .then((genre) => {
            res.json(genre.description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/directors/:name', (req, res) => {
    directors.findOne({ name: req.params.name})
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/users', function (req, res) {
    users.find()
        .then(function(users) {
            res.status(201).json(users);
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

app.post('/users', (req, res) => {
    users.findOne({ username: req.body.username})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
                users.create({
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    birthday: req.body.birthday
                    })
                    .then((user) => {
                        res.status(201).json(user);
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

app.put('/users/:username', (req, res) => {
    users.findOneAndUpdate(
        { username: req.params.username },
        {
            $set: {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                birthday: req.body.birthday,
            },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

app.delete('/users/:username', (req, res) => {
    users.findOneAndRemove({ username: req.params.username })
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
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Error: User must have a name')
    }
})

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if(user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('Error: User not found')
    }
})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


    let user = users.find( user => user.id == id );

    if(user) {
        user.favoriteMovie.push(movieTitle);
        res.status(200).send('${movieTitle} has been added to user ${id}\'s favorite movies');
    } else {
        res.status(400).send('Error: User not found')
    }
})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;


    let user = users.find( user => user.id == id );

    if(user) {
        user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle );
        res.status(200).send('${movieTitle} has been removed from user ${id}\'s favorite movies');
    } else {
        res.status(400).send('Error: User not found')
    }
})

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;


    let user = users.find( user => user.id == id );

    if(user) {
        users = users.filter( user => user.id != id );
        res.status(200).send('User ${id} has been deleted');
    } else {
        res.status(400).send('Error: User not found')
    }
})

//READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//READ
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.title === title );

    if (movie) {
        res.status(200).json(movie);
    } else{
        res.status(400).send('Movie not found');
    }
})

//READ
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.genre.name === genreName ).genre;

    if (genre) {
        res.status(200).json(genre);
    } else{
        res.status(400).send('Genre not found');
    }
})

//READ
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.director.name === directorName ).director;

    if (director) {
        res.status(200).json(director);
    } else{
        res.status(400).send('Genre not found');
    }
})

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

