const fs = require("fs");
const path = require("path");

const DATA_DIR = "/data";

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS = path.join(DATA_DIR, "users.json");
const EVENTS = path.join(DATA_DIR, "events.json");

function create(file, data) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
}

create(USERS, {
    users: {}
});

create(EVENTS, {
    garudaMessage: null,
    garudaSchedule: [],
    currentMonument: 0,
    monumentProgress: 0,
    combo: null,
    lastSchedule: null
});

function load(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

let users = load(USERS);
let events = load(EVENTS);

function saveUsers() {
    fs.writeFileSync(
        USERS,
        JSON.stringify(users, null, 2)
    );
}

function saveEvents() {
    fs.writeFileSync(
        EVENTS,
        JSON.stringify(events, null, 2)
    );
}

function saveAll() {
    saveUsers();
    saveEvents();
}

function getUser(id, username) {

    if (!users.users[id]) {

        users.users[id] = {

id,

username,

points:0,

robux:0,

garuda:0,

monumen:0,

combo:0,

level:1,

exp:0,

lastBuild:0,

created:Date.now()

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

        while (user.exp >= user.level * 30) {

            user.exp -= user.level * 30;

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

function leaderboard() {

    return Object.values(users.users)

        .sort((a, b) => b.points - a.points);

}

module.exports = {

    users,

    events,

    saveUsers,

    saveEvents,

    saveAll,

    getUser,

    addPoint,

    removePoint,

    leaderboard

};
