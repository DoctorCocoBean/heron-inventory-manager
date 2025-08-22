"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const node_path_1 = __importDefault(require("node:path"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const db = __importStar(require("./pool/queries")); // For typescript
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
const app = (0, express_1.default)();
const assetsPath = node_path_1.default.join(__dirname, "public");
app.use(express_1.default.static(assetsPath));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
// Views
app.set("views", node_path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express_session_1.default({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport_1.default.session());
passport_1.default.use(new passport_local_1.default((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.getUserByUsername(username);
        const match = yield bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            return done(null, false, { message: "Incorrect password." });
        }
        if (!user) {
            return done(null, false, { message: "Incorrect username." });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
var options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
};
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.getUserById(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
// Routers
const indexRouter_1 = __importDefault(require("./routes/indexRouter"));
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