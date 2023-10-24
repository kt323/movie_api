const express = require('express');
// const morgan = require('morgan');
    app = express();
    bodyParser = require('body-parser');
    uuid = require('uuid');

app.use(bodyParser.json());
// app.use(express.static('public'));

// app.use(morgan('common'));

let users = [
    {
        id: 1,
        name: "Remy",
        favoriteMovie: []
    },
    {
        id: 2,
        name: "Sammy",
        favoriteMovie: ["Iron Man"]
    },
]

let movies = [
    {
        'title': 'Avengers: Endgame',
        'description': 'After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
        'year': '2019',
        'director': {
            'name': 'Anthony Russo',
            'bio': 'Anthony Russo was born on February 3, 1970 in Cleveland, Ohio, USA as Anthony J. Russo. He is a producer and director, known for Avengers: Endgame (2019), Avengers: Infinity War (2018) and Captain America: The Winter Soldier (2014). He has been married to Ann Russo since August 28, 1999. They have three children.',
            'birth': '1970-02-03'
        },
        'genre': {
            'name':'Action',
            'description': 'Action films usually include high energy, big-budget physical stunts and chases, possibly with rescues, battles, fights, escapes, destructive crises (floods, explosions, natural disasters, fires, etc.), non-stop motion, spectacular rhythm and pacing, and adventurous, often two-dimensional \'good-guy\' heroes (or recently, heroines) battling \'bad guys\' - all designed for pure audience escapism.'
    },
        'imageURL': 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg'
},  
    {
        'title': 'Black Panther',
        'description': 'T\'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future and must confront a challenger from his country\'s past.',
        'year': '2018',
        'director': {
            'name': 'Ryan Coogler',
            'bio': 'Ryan Coogler was born on May 23, 1986 in Oakland, California, USA as Ryan Kyle Coogler. He is a director and writer, known for Black Panther (2018), Creed (2015) and Fruitvale Station (2013). He has been married to Zinzi Evans since 2016.',
            'birth': '1986-05-23'
        },
        'genre': {
            'name': 'Sci-Fi',
            'description': 'Sci-fi films are often quasi-scientific, visionary and imaginative - complete with heroes, aliens, distant planets, impossible quests, improbable settings, fantastic places, great dark and shadowy villains, futuristic technology, unknown and unknowable forces, and extraordinary monsters ( \'things or creatures from space\' ), either created by mad scientists or by nuclear havoc.'
    },
        'imageURL': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Black_Panther_film_poster.jpg'
    },
    {
        'title': 'Iron Man',
        'description': 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
        'year': '2008',
        'director': {
            'name': 'Jon Favreau',
            'bio': 'Initially an indie film favorite, actor Jon Favreau has progressed to strong mainstream visibility into the millennium and, after nearly two decades in the business, is still enjoying character stardom as well as earning notice as a writer/producer/director.',
            'birth': '1966-10-19'
        },
        'genre': {
            'name': 'Adventure',
            'description': 'Adventure films are exciting stories, with new experiences or exotic locales. Adventure films are very similar to the action film genre, in that they are designed to provide an action-filled, energetic experience for the film viewer.'
    },
        'imageURL': 'https://upload.wikimedia.org/wikipedia/en/7/70/Ironmanposter.JPG'
    },
    {
        'title': 'Spider-Man: Homecoming',
        'description': '15-year-old Peter Parker (Tom Holland) can\'t wait to help his new mentor, Tony Stark (Robert Downey Jr.), with any superhero work the latter might have available. But Stark wants to keep his young protege safe at home in Queens, living with his Aunt May.',
        'year': '2017',
        'director': {
            'name': 'Jonathan Watts',
            'bio': 'Jonathan Watts is an American filmmaker. His credits include directing the Marvel Cinematic Universe superhero films Spider-Man: Homecoming, Spider-Man: Far From Home, and Spider-Man: No Way Home.',
            'birth': '1981-06-28'
        },
        'genre': {
            'name': 'Action',
            'description': 'Action films usually include high energy, big-budget physical stunts and chases, possibly with rescues, battles, fights, escapes, destructive crises (floods, explosions, natural disasters, fires, etc.), non-stop motion, spectacular rhythm and pacing, and adventurous, often two-dimensional \'good-guy\' heroes (or recently, heroines) battling \'bad guys\' - all designed for pure audience escapism.'
    },
        'imageURl': 'https://en.wikipedia.org/wiki/Spider-Man:_Homecoming#/media/File:Spider-Man_Homecoming_poster.jpg'
},
    {
        'title': 'Guardians of the Galaxy',
        'description': 'Brash space adventurer Peter Quill (Chris Pratt) finds himself the quarry of relentless bounty hunters after he steals an orb coveted by Ronan, a powerful villain. To evade Ronan, Quill is forced into an uneasy truce with four disparate misfits: gun-toting Rocket Raccoon, treelike-humanoid Groot, enigmatic Gamora, and vengeance-driven Drax the Destroyer.',
        'year': '2014',
        'director': {
            'name': 'James Gunn',
            'bio': 'James Gunn was born and raised in St. Louis, Missouri, to Leota and James Francis Gunn. He is from a large Catholic family, with Irish and Czech ancestry. His father and his uncles were all lawyers. He has been writing and performing as long as he can remember.',
            'birth': '1966-08-05'
        },
        'genre': {
            'name': 'Comedy',
            'description': 'Comedy films are "make \'em laugh" films designed to elicit laughter from the audience. Comedies are light-hearted dramas, crafted to amuse, entertain, and provoke enjoyment. The comedy genre humorously exaggerates the situation, the language, action, and characters.'
    },
        'imageURL': 'https://upload.wikimedia.org/wikipedia/en/b/b5/Guardians_of_the_Galaxy_poster.jpg'
},
];


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