import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import useLocalStorage from "./useLocalStorage";
import db, { DBService } from "./database.js";
import { onValue, get, child, ref, update } from "firebase/database";

function App() {
  const [gameKey, setGameKey] = useState(null);
  const [game, setGame] = useState(null);
  const [playerKey, setPlayerKey] = useLocalStorage("player", null);
  const [players, setPlayers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(null);
  const [usedWords, setUsedWords] = useState({});

  const playerIsCreator = game?.creator === playerKey;
  const gameIsReady = game?.status === "ready";
  const gameIsActive = game?.status === "active";
  const gameIsComplete = game?.status === "complete";
  const timeRemaining = game?.timeRemaining;
  const characters = game?.characters;

  function initNewGame() {
    const firstPlayerName = prompt("What is your name?");

    DBService.initGame(firstPlayerName).then(({ gameKey, playerKey }) => {
      setGameKey(gameKey);
      setPlayerKey(playerKey);
      window.history.pushState({}, "", `/games/${gameKey}`);
    });
  }

  function startGame() {
    DBService.startGame(gameKey);

    let interval = null;
    interval = setInterval(() => {
      const dbRef = ref(db);
      const gameRef = child(ref(db), `games/${gameKey}`);

      get(child(dbRef, `games/${gameKey}`)).then((gameSnapshot) => {
        const game = gameSnapshot.val();

        if (game.timeRemaining <= 0) {
          update(gameRef, { status: "complete" });
          return clearInterval(interval);
        } else {
          update(gameRef, { timeRemaining: game.timeRemaining - 1 });
        }
      });
    }, 1000);
  }

  function checkInputValue() {
    if (usedWords && usedWords[inputValue]) {
      return "Word has already been used!";
    }

    const usedChars = {};
    const inputtedChars = inputValue.split("");

    let error = null;
    inputtedChars.every((char) => {
      if (!characters.includes(char)) {
        error = "Invalid character(s)";
        return false;
      }

      if (usedChars[char]) {
        error = "Characters can only be used once!";
        return false;
      }

      usedChars[char] = true;

      return true;
    });

    return error;
  }

  function handleSubmitWord() {
    const error = checkInputValue();

    if (error) {
      setInputError(error);
      return;
    }

    DBService.addWord(gameKey, playerKey, inputValue);
    setInputValue("");
    setInputError(null);
  }

  function generateGameResults() {
    const results = {};
    Object.entries(usedWords).forEach(([word, playerKey]) => {
      results[playerKey] = (results[playerKey] || 0) + word.length;
    });

    return results;
  }

  function startOver() {
    localStorage.removeItem("player");
    window.history.pushState({}, "", `/`);
    setGame(null);
    setPlayerKey(null);
    setPlayers(null);
  }

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("games")) {
      const gameKeyFromPath = path.split("/")[2];

      gameKeyFromPath && setGameKey(gameKeyFromPath);

      // add a new player
      if (gameKeyFromPath && !playerKey && gameIsReady) {
        const playerName = prompt("What is your name?");

        DBService.addPlayer(gameKeyFromPath, playerName).then((playerKey) =>
          setPlayerKey(playerKey)
        );
      }
    } else {
      localStorage.removeItem("player");
    }
  }, [gameIsReady]);

  useEffect(() => {
    if (gameKey) {
      const gamePlayersRef = ref(db, `game_players/${gameKey}`);
      const gameRef = child(ref(db), `games/${gameKey}`);
      const wordsRef = child(ref(db), `words/${gameKey}`);

      onValue(gamePlayersRef, (snapshot) => {
        setPlayers(snapshot.val());
      });

      onValue(gameRef, (snapshot) => {
        setGame(snapshot.val());
      });

      onValue(wordsRef, (snapshot) => {
        setUsedWords(snapshot.val());
      });
    }
  }, [gameKey]);

  const renderStartOverButton = () => {
    return (
      <Button style={{ marginTop: 100 }} danger onClick={startOver}>
        Reset
      </Button>
    );
  };

  const renderLandingScreen = () => {
    return (
      <>
        <h1>Welcome to WordDuet</h1>
        <h3>Click the button below to start a new game!</h3>
        <Button type="primary" onClick={initNewGame}>
          Start a new game
        </Button>
      </>
    );
  };

  const renderPreGame = () => {
    return (
      <>
        <h1 style={{ textAlign: "center" }}>
          Invite others to play the game with the link below!
        </h1>
        <Input
          style={{ width: 250, marginBottom: 30 }}
          value={window.location.href}
        />
        <h2>Players</h2>
        {players &&
          Object.entries(players).map(([key, value]) => {
            return <p key={key}>{value}</p>;
          })}

        {playerIsCreator && (
          <Button
            type="primary"
            onClick={startGame}
            disabled={Object.keys(players || {}).length < 2}
          >
            Play!
          </Button>
        )}

        {renderStartOverButton()}
      </>
    );
  };

  const renderActiveGame = () => {
    return (
      <>
        <h1>Play!</h1>
        <h2 style={{ letterSpacing: "0.5em" }}>{characters.toUpperCase()}</h2>
        <h2>Time Remaining: {timeRemaining} seconds</h2>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toLowerCase())}
          onPressEnter={handleSubmitWord}
          maxLength={9}
          style={{ width: 250, marginBottom: 20 }}
        />
        <Button onClick={handleSubmitWord} disabled={!inputValue.length}>
          Submit
        </Button>
        <p style={{ color: "red" }}>{inputError}</p>

        <br />
        <h3>Words already used</h3>
        {usedWords &&
          Object.entries(usedWords).map(([word, wordPlayerKey]) => {
            return (
              <p key={word}>
                {word} ({players[wordPlayerKey]})
              </p>
            );
          })}

        {renderStartOverButton()}
      </>
    );
  };

  const renderCompleteGame = () => {
    const results = generateGameResults();

    return (
      <>
        <h1>Finished!</h1>
        {Object.entries(results)
          .sort(([, a], [, b]) => (a > b ? -1 : 1))
          .map(([playerKey, score]) => {
            return (
              <p key={playerKey}>
                {players[playerKey]} scored {score} points
              </p>
            );
          })}
        {renderStartOverButton()}
      </>
    );
  };

  if (!game) return renderLandingScreen();
  if (gameIsReady) return renderPreGame();
  if (gameIsActive) return renderActiveGame();
  if (gameIsComplete) return renderCompleteGame();

  return <h1>LOADING</h1>;
}

export default App;
