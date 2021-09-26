import * as firebase from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  onValue,
  update,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBboCcsaocq8BWlKbiEsXILOTrGOkFs3W0",
  authDomain: "wd-word-game.firebaseapp.com",
  databaseURL: "https://wd-word-game-default-rtdb.firebaseio.com/",
  projectId: "wd-word-game",
  storageBucket: "wd-word-game.appspot.com",
  messagingSenderId: "708268434259",
  appId: "1:708268434259:web:bd5c2bc7adf7349d65b7a6",
};

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

const initGame = async (firstPlayerName) => {
  const playerRef = await push(ref(db, "players/"), { name: firstPlayerName });
  const playerKey = playerRef.key;
  const gameRef = await push(ref(db, "games/"), {
    status: "ready",
    timeRemaining: 60,
    creator: playerKey,
    winner: null,
    characters: generateChars(),
  });
  const gameKey = gameRef.key;

  await set(ref(db, `game_players/${gameKey}/${playerKey}`), firstPlayerName);

  return {
    gameKey,
    playerKey,
  };
};

const startGame = (gameKey) => {
  const gameRef = child(ref(db), `games/${gameKey}`);

  update(gameRef, { status: "active" });
};

// const updateTimeRemaining = async (gameKey, timeRemaining) => {
//   const gameRef = child(ref(db), `games/${gameKey}`);
//   console.log("UPDATE", timeRemaining);
//   update(gameRef, { timeRemaining })
//     .then((data) => console.log("data"))
//     .catch((err) => console.error(err));
// };

const addPlayer = async (gameKey, playerName) => {
  const playerRef = await push(ref(db, "players/"), { name: playerName });
  const playerKey = playerRef?.key;
  if (playerKey) {
    await set(ref(db, `game_players/${gameKey}/${playerRef?.key}`), playerName);
  }

  return playerKey;
};

const addWord = async (gameKey, playerKey, word) => {
  const wordRef = child(ref(db), `words/${gameKey}/${word}`);
  await set(wordRef, playerKey);
};

// const playersValue = async (gameKey) => {
//   console.log("player values");
//
//   let gamePlayers = null;
//   // const snapshot =
//   // console.log({ snapshot });
//
//   return gamePlayers;
// };

export const DBService = {
  initGame,
  addPlayer,
  startGame,
  addWord,
};

export default db;

function getRandomItemInArray(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function copyAndRemoveItemFromArray(array, itemToRemove) {
  const copy = [...array];
  const index = copy.indexOf(itemToRemove);
  if (index > -1) {
    copy.splice(index, 1);
  }

  return copy;
}

function generateChars() {
  const vowels = ["a", "e", "i", "o", "u"];
  const consanants = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  const finalChars = [];
  let vowelsRemaining = [...vowels];
  let consonantsRemaining = [...consanants];

  const vowel1 = getRandomItemInArray(vowelsRemaining);
  finalChars.push(vowel1);
  vowelsRemaining = copyAndRemoveItemFromArray(vowelsRemaining, vowel1);

  const vowel2 = getRandomItemInArray(vowelsRemaining);
  finalChars.push(vowel2);
  vowelsRemaining = copyAndRemoveItemFromArray(vowelsRemaining, vowel2);

  const consonant1 = getRandomItemInArray(consonantsRemaining);
  finalChars.push(consonant1);
  consonantsRemaining = copyAndRemoveItemFromArray(
    consonantsRemaining,
    consonant1
  );

  const consonant2 = getRandomItemInArray(consonantsRemaining);
  finalChars.push(consonant2);
  consonantsRemaining = copyAndRemoveItemFromArray(
    consonantsRemaining,
    consonant2
  );

  let lettersRemaining = [...consonantsRemaining, ...vowelsRemaining];

  for (let i = 0; i < 5; i++) {
    const letter = getRandomItemInArray(lettersRemaining);
    finalChars.push(letter);
    lettersRemaining = copyAndRemoveItemFromArray(lettersRemaining, letter);
  }

  return finalChars.sort((a, b) => (a > b ? 1 : -1)).join("");
}
