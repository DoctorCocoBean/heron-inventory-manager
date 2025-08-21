"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const db = require("./pool/queries"); // For typescript
// import db from './pool/queries'; // Adjusted import for JavaScript
const bcrypt = require("bcryptjs");
const app = express();
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
passport.use(new localStrategy((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.getUserByUsername(username);
        const match = yield bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, { message: "Incorrect password." });
        }
        if (!user) {
            return done(null, false, { message: "Incorrect username." });
        }
        console.log('am I going here?');
        console.log('am I going here?');
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.getUserById(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
// Routers
const indexRouter_1 = require("./routes/indexRouter");
app.use("/", indexRouter_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`----START----- (Port: ${PORT})`);
});
//# sourceMappingURL=app.js.map