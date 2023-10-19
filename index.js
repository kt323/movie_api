const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.static('public'));

app.use(morgan('common'));


let topMovies = [
    {
        title: 'Avengers: Endgame',
        year: '2019',
        director: 'Anthony Russo, Joe Russo',
        genre: 'Action, Adventure, Drama',
    },
    {
        title: 'Black Panther',
        year: '2018',
        director: 'Ryan Coogler',
        genre: 'Action, Adventure, Sci-Fi',
    },
    {
        title: 'Iron Man',
        year: '2008',
        director: 'Jon Favreau',
        genre: 'Action, Adventure, Sci-Fi',
    },
    {
        title: 'Thor: Ragnarok',
        year: '2017',
        director: 'Taika Waititi',
        genre: 'Action, Adventure, Comedy',
    },
    {
        title: 'Spider-Man: Homecoming',
        year: '2017',
        director: 'Jon Watts',
        genre: 'Action, Adventure, Sci-Fi',
    },
    {
        title: 'Guardians of the Galaxy',
        year: '2014',
        director: 'James Gunn',
        genre: 'Action, Adventure, Comedy',
    },
    {
        title: 'Captain America: Civil War',
        year: '2016',
        director: 'Anthony Russo, Joe Russo',
        genre: 'Action, Adventure, Sci-Fi',
    },
    {
        title: 'The Avengers',
        year: '2012',
        director: 'Joss Whedon',
        genre: 'Action, Adventure, Sci-Fi',
    },
    {
        title: 'Doctor Strange in the Multiverse of Madness',
        year: '2022',
        director: 'Sam Raimi',
        genre: 'Action, Adventure, Fantasy',
    },
    {
        title: 'Ant-Man and the Wasp: Quantumania',
        year: '2022',
        director: 'Peyton Reed',
        genre: 'Action, Adventure, Comedy',
    },
];

app.get('/', (req, res) => {
    res.send('Welcome to my top 10 movies!');
});

app.get('/documentation', (req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});


app.get('/top10movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Something went wrong!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});