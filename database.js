const fs = require("fs");
const path = require("path");

const DATA_PATH = "/data";

if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
}

const USERS_FILE = path.join(DATA_PATH, "users.json");
const EVENTS_FILE = path.join(DATA_PATH, "events.json");
const LEADERBOARD_FILE = path.join(DATA_PATH, "leaderboard.json");

function create(file, data) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
}

create(USERS_FILE, {
    users: {}
});

create(EVENTS_FILE, {
    garudaMessage: null,
    upacaraMessage: null,
    monumentMessage: null,
    comboMessage: null,
    currentMonument: 0,
    progress: 0,
    lastGaruda: 0,
    lastUpacara: 0,
    lastLeaderboard: 0
});

create(LEADERBOARD_FILE, {
    messageId: null
});

function load(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

let users = load(USERS_FILE);
let events = load(EVENTS_FILE);
let leaderboard = load(LEADERBOARD_FILE);

function saveUsers() {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );
}

function saveEvents() {
    fs.writeFileSync(
        EVENTS_FILE,
        JSON.stringify(events, null, 2)
    );
}

function saveLeaderboard() {
    fs.writeFileSync(
        LEADERBOARD_FILE,
        JSON.stringify(leaderboard, null, 2)
    );
}

function saveAll() {
    saveUsers();
    saveEvents();
    saveLeaderboard();
}

function getUser(id, username) {

    if (!users.users[id]) {

        users.users[id] = {

            id,

            username,

            points: 0,

            garuda: 0,

            upacara: 0,

            build: 0,

            combo: 0,

            level: 1,

            exp: 0,

            lastBuild: 0,

            join: Date.now()

        };

        saveUsers();

    }

    return users.users[id];

}

function addPoint(id, username, point) {

    const user = getUser(id, username);

    user.points += point;

    if (point > 0) {

        user.exp += point;

        while (user.exp >= user.level * 25) {

            user.exp -= user.level * 25;

            user.level++;

        }

    }

    saveUsers();

    return user;

}

function removePoint(id, username, point) {

    const user = getUser(id, username);

    user.points -= point;

    if (user.points < 0)
        user.points = 0;

    saveUsers();

    return user;

}

function leaderboardData() {

    return Object.values(users.users)

        .sort((a, b) => b.points - a.points);

}

module.exports = {

    users,

    events,

    leaderboard,

    getUser,

    addPoint,

    removePoint,

    leaderboardData,

    saveUsers,

    saveEvents,

    saveLeaderboard,

    saveAll

};
