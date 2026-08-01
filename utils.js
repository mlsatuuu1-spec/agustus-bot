// ======================
// RANDOM
// ======================

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

// ======================
// FORMAT ANGKA
// ======================

function format(num) {

    return new Intl.NumberFormat("id-ID").format(num);

}

// ======================
// TIER
// ======================

function getTier(points) {

    if (points >= 2000)
        return "🔥 Cashback Overlord";

    if (points >= 1200)
        return "👑 Cashback Sultan";

    if (points >= 750)
        return "💎 Cashback Elite";

    if (points >= 400)
        return "🏦 Cashback Investor";

    if (points >= 200)
        return "💰 Cashback Grinder";

    if (points >= 75)
        return "🪙 Cashback Hunter";

    if (points >= 25)
        return "💵 Cashback Rookie";

    return "▫️ Belum ada Tier";

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
item:"Medali Kemerdekaan",
point:4,
chance:10,
text:"🎖️ Garuda menghadiahimu medali."
},

{
emoji:"🚗",
item:"Avanza",
point:4,
chance:5,
text:"🚗 Entah dari mana Garuda menjatuhkan Avanza."
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
chance:8,
text:"🩴 Lumayan dapat sandal."
},

{
emoji:"💩",
item:"Tai Ayam",
point:-5,
chance:18,
text:"💩 Astaga... Garuda malah menjatuhkan tai ayam."
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
chance:6,
text:"🦟 Digigit nyamuk."
},

{
emoji:"🪨",
item:"Kesandung Batu",
point:-1,
chance:4,
text:"🪨 Kamu kesandung batu."
},

{
emoji:"👑",
item:"Mahkota Garuda",
point:20,
chance:0.5,
text:"👑 JACKPOT!! Mahkota Garuda!"
},

{
emoji:"💰",
item:"Karung Robux",
point:15,
chance:0.5,
text:"💰 JACKPOT!! Karung Robux!"
}

];

// ======================
// RANDOM HADIAH
// ======================

function randomReward() {

    const total =
        rewards.reduce(
            (sum, reward) => sum + reward.chance,
            0
        );

    let roll = Math.random() * total;

    for (const reward of rewards) {

        if (roll < reward.chance)
            return reward;

        roll -= reward.chance;

    }

    return rewards[0];

}

// ======================
// MONUMEN
// ======================

const monuments = [

"Monas",

"Borobudur",

"Prambanan",

"Suramadu",

"Jam Gadang",

"GWK",

"Tugu Pahlawan",

"Istana Merdeka"

];

// ======================

module.exports = {

random,

format,

getTier,

randomReward,

monuments

};
