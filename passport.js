const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const users = Models.user;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            try {
              const user = await users.findOne({ username: username });
              if (!user) {
                    console.log('incorrect username');
                return callback(null, false, {
                    message: 'Incorrect username or password.',
                });
              }
              if (!user.validatePassword(password)) {
                    console.log('incorrect password');
                return callback(null, false, { message: 'Incorrect password.' });
              }
                console.log('finished');
              return callback(null, user);
            } catch (error) {
                console.error(error);
              return callback(error);
            }
          }
        )
      );

      passport.use(
        new JWTStrategy(
          {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret',
          },
          async (jwtPayload, callback) => {
            try {
              const user = await users.findById(jwtPayload._id);
              if (!user) {
                return callback(null, false, { message: 'User not found.' });
              }
              return callback(null, user);
            } catch (error) {
              console.error(error);
              return callback(error);
            }
          }
        )
      );
