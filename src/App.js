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
  const [words, setUsedWords] = useState(null);

  const playerIsCreator = game?.creator === playerKey;
  const gameIsReady = game?.status === "ready";
  const gameIsActive = game?.status === "active";
  const gameIsComplete = game?.status === "complete";
  const timeRemaining = game?.timeRemaining;
  const characters = game?.characters.split("");
  // console.log({
  //   //   gameKey,
  //   //   playerKey,
  //   //   players,
  //   //   game,
  //   //   gameIsReady,
  //   //   gameIsActive,
  //   //   timeRemaining,
  //   // });

  function initNewGame() {
    const firstPlayerName = prompt("What is your name?");

    DBService.initGame(firstPlayerName).then(({ gameKey, playerKey }) => {
      setGameKey(gameKey);
      setPlayerKey(playerKey);
      window.location.href = `/games/${gameKey}`;
    });
  }

  function startGame() {
    console.log("start game");
    DBService.startGame(gameKey);

    let interval = null;
    // interval = setInterval(() => {
    //   const dbRef = ref(db);
    //   const gameRef = child(ref(db), `games/${gameKey}`);
    //
    //   get(child(dbRef, `games/${gameKey}`)).then((gameSnapshot) => {
    //     const game = gameSnapshot.val();
    //     console.log({ game });
    //
    //     if (game.timeRemaining <= 0) {
    //       update(gameRef, { status: "complete" });
    //       return clearInterval(interval);
    //     } else {
    //       update(gameRef, { timeRemaining: game.timeRemaining - 1 });
    //     }
    //   });
    //
    //   //clearInterval
    // }, 1000);
  }

  function checkInputValue() {
    const usedChars = {}
    const inputtedChars = inputValue.split("");

    console.log({ inputtedChars });
  }

  function handleSubmitWord() {
    const error = checkInputValue();
    // clear input
    // TODO handle validation
    // Order of the
    // letters doesn't matter, but each letter can be used at most once
    // per word.
    console.log("SUBMIT", inputValue);
  }

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("games")) {
      const gameKeyFromPath = path.split("/")[2];

      gameKeyFromPath && setGameKey(gameKeyFromPath);

      // add a new player
      if (gameKeyFromPath && !playerKey) {
        const playerName = prompt("What is your name?");

        DBService.addPlayer(gameKeyFromPath, playerName).then((playerKey) =>
          setPlayerKey(playerKey)
        );
      }
    } else {
      localStorage.removeItem("player");
    }
  }, []);

  useEffect(() => {
    if (gameKey) {
      const gamePlayersRef = ref(db, `game_players/${gameKey}`);
      const gameRef = child(ref(db), `games/${gameKey}`);

      onValue(gamePlayersRef, (snapshot) => {
        setPlayers(snapshot.val());
      });

      onValue(gameRef, (snapshot) => {
        setGame(snapshot.val());
      });

      // update game as we go
      const dbRef = ref(db);
      get(child(dbRef, `games/${gameKey}`)).then((snapshot) => {
        const game = snapshot.val();

        if (!game) {
          window.location.href = "/";
        }
        setGame(snapshot.val());
      });
    }
  }, [gameKey]);

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
        <h1>Game</h1>
        <h3>Players</h3>
        {players &&
          Object.entries(players).map(([key, value]) => {
            return <p key={key}>{value}</p>;
          })}

        {playerIsCreator && <Button onClick={startGame}>Play!</Button>}
      </>
    );
  };

  const renderActiveGame = () => {
    return (
      <>
        <h1>Play!</h1>
        <h3>{timeRemaining}</h3>
        <Input
          value={inputValue}
          onChange={(e) => {
            // TODO handle validation
            setInputValue(e.target.value);
          }}
          onPressEnter={handleSubmitWord}
          maxLength={9}
          style={{ width: 250, marginBottom: 20 }}
        />
        <Button onClick={handleSubmitWord} disabled={!inputValue.length}>
          Submit
        </Button>
        <p style={{ color: "red" }}>{inputError}</p>
      </>
    );
  };

  const renderCompleteGame = () => {
    return <h1>COMPLETE</h1>;
  };

  if (!game) return renderLandingScreen();
  if (gameIsReady) return renderPreGame();
  if (gameIsActive) return renderActiveGame();
  if (gameIsComplete) return renderCompleteGame();

  return renderLandingScreen();
}

export default App;
