
import * as express from 'express';
import * as path from 'node:path';
import * as session from 'express-session';
import * as passport from 'passport';
import * as localStrategy from 'passport-local';
import * as db from './pool/queries';
import * as bcrypt from 'bcryptjs';

const app   = express();
const assetsPath = path.join(__dirname, "public");

app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());

passport.use(
    new localStrategy(async (username, password, done) => {
        try {
            const user = await db.getUserByUsername(username);

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password." });
            }

            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Routers
import indexRouter from './routes/indexRouter';

app.use("/", indexRouter);
app.use((err, req, res, next) => 
{
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(err.status || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
    console.log(`----START----- (Port: ${PORT})`);
});