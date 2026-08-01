// ======================
// RANDOM
// ======================

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

// ======================
// FORMAT
// ======================

function formatNumber(num) {

    return new Intl.NumberFormat("id-ID").format(num);

}

// ======================
// TIER
// ======================

function getTier(point) {

    if (point >= 2000)
        return {
            emoji: "🔥",
            name: "Cashback Overlord"
        };

    if (point >= 1200)
        return {
            emoji: "👑",
            name: "Cashback Sultan"
        };

    if (point >= 750)
        return {
            emoji: "💎",
            name: "Cashback Elite"
        };

    if (point >= 400)
        return {
            emoji: "🏦",
            name: "Cashback Investor"
        };

    if (point >= 200)
        return {
            emoji: "💰",
            name: "Cashback Grinder"
        };

    if (point >= 75)
        return {
            emoji: "🪙",
            name: "Cashback Hunter"
        };

    if (point >= 25)
        return {
            emoji: "💵",
            name: "Cashback Rookie"
        };

    return {
        emoji: "▫️",
        name: "-"
    };

}

// ======================
// GARUDA REWARD
// ======================

const rewards = [

{
emoji:"🇮🇩",
item:"Bendera Merah Putih",
point:5,
chance:15,
text:"🇮🇩 Kamu berhasil menangkap Garuda!"
},

{
emoji:"🎖️",
item:"Medali",
point:4,
chance:10,
text:"🎖️ Garuda menghadiahimu sebuah medali."
},

{
emoji:"🚗",
item:"Avanza",
point:4,
chance:7,
text:"🚗 Garuda menjatuhkan sebuah Avanza."
},

{
emoji:"🍜",
item:"Mie Ayam",
point:2,
chance:15,
text:"🍜 Kamu mendapat mie ayam."
},

{
emoji:"🥭",
item:"Mangga",
point:1,
chance:10,
text:"🥭 Garuda menjatuhkan mangga."
},

{
emoji:"🩴",
item:"Sandal Jepit",
point:2,
chance:10,
text:"🩴 Lumayan dapat sandal."
},

{
emoji:"💩",
item:"Tai Ayam",
point:-5,
chance:18,
text:"💩 Garuda malah menjatuhkan tai ayam."
},

{
emoji:"🐄",
item:"Tai Kebo",
point:-3,
chance:8,
text:"🐄 Kamu kena tai kebo."
},

{
emoji:"🦟",
item:"Nyamuk",
point:-2,
chance:5,
text:"🦟 Digigit nyamuk."
},

{
emoji:"🪨",
item:"Kesandung Batu",
point:-1,
chance:1.5,
text:"🪨 Kamu kesandung batu."
},

{
emoji:"👑",
item:"Mahkota Garuda",
point:20,
chance:0.25,
text:"👑 JACKPOT!! Mahkota Garuda!"
},

{
emoji:"💰",
item:"Karung Robux",
point:15,
chance:0.25,
text:"💰 JACKPOT!! Karung Robux!"
}

];

// ======================
// RANDOM REWARD
// ======================

function randomReward() {

    let total = 0;

    rewards.forEach(r => total += r.chance);

    let roll = Math.random() * total;

    for (const reward of rewards) {

        if (roll < reward.chance)
            return reward;

        roll -= reward.chance;

    }

    return rewards[0];

}

// ======================

module.exports = {

random,

formatNumber,

getTier,

randomReward

};
