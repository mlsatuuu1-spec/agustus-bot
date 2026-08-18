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

    return new Intl.NumberFormat("id-ID")
        .format(num);

}


// ======================
// GARUDA REWARD
// ======================

const rewards = [

    // ======================
    // 🟢 POSITIF — 60%
// ======================

    {
        emoji: "🇮🇩",
        item: "Bendera Merah Putih",
        point: 12,
        chance: 15,
        text:
            "🇮🇩 Kamu berhasil menangkap Garuda!"
    },

    {
        emoji: "🎖️",
        item: "Medali Kemerdekaan",
        point: 15,
        chance: 15,
        text:
            "🎖️ Garuda menghadiahimu Medali Kemerdekaan!"
    },

    {
        emoji: "🍜",
        item: "Mie Ayam",
        point: 11,
        chance: 12,
        text:
            "🍜 Kamu mendapat mie ayam!"
    },

    {
        emoji: "🥭",
        item: "Mangga",
        point: 13,
        chance: 10,
        text:
            "🥭 Garuda menjatuhkan mangga!"
    },

    {
        emoji: "🩴",
        item: "Sandal Jepit",
        point: 14,
        chance: 8,
        text:
            "🩴 Lumayan! Kamu mendapat sandal."
    },


    // ======================
    // 🔴 MINUS — 38%
    // ======================

    {
        emoji: "💩",
        item: "Tai Ayam",
        point: -4,
        chance: 12,
        text:
            "💩 Astaga... Garuda malah menjatuhkan tai ayam."
    },

    {
        emoji: "👹",
        item: "Bu Juleha",
        point: -5,
        chance: 8,
        text:
            "👹 Sial... Garuda malah kirim cocotan Bu Juleha."
    },

    {
        emoji: "🦟",
        item: "Nyamuk",
        point: -3,
        chance: 7,
        text:
            "🦟 Kamu malah digigit nyamuk."
    },

    {
        emoji: "🐄",
        item: "Tai Kebo",
        point: -10,
        chance: 6,
        text:
            "🐄 Waduh! Kamu kena tai kebo."
    },

    {
        emoji: "☠️",
        item: "Garuda Sial",
        point: -15,
        chance: 5,
        text:
            "☠️ GARUDA SIAL! Kamu kehilangan banyak poin."
    },


    // ======================
    // 💎 JACKPOT — 2%
// ======================

    {
        emoji: "👑",
        item: "Mahkota Garuda",
        point: 20,
        chance: 0.8,
        text:
            "👑 JACKPOT!! Kamu mendapatkan Mahkota Garuda!"
    },

    {
        emoji: "💰",
        item: "Karung Robux",
        point: 30,
        chance: 0.7,
        text:
            "💰 JACKPOT!! Garuda menjatuhkan Karung Robux!"
    },

    {
        emoji: "🚗",
        item: "Avanza",
        point: 50,
        chance: 0.5,
        text:
            "🚗 JACKPOT!! Garuda menjatuhkan Avanza!"
    }

];


// ======================
// RANDOM HADIAH
// ======================

function randomReward() {

    const total =
        rewards.reduce(
            (sum, reward) =>
                sum + reward.chance,
            0
        );

    let roll =
        Math.random() * total;

    for (const reward of rewards) {

        if (roll < reward.chance) {

            return {
                ...reward
            };

        }

        roll -= reward.chance;

    }

    return {
        ...rewards[0]
    };

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
    "Simpang Lima Gumul",
    "Tugu Pahlawan",
    "Istana Merdeka"

];


// ======================
// EXPORT
// ======================

module.exports = {

    random,
    format,
    randomReward,
    monuments

};