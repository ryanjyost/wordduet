import React, { useState, useEffect, useMemo } from "react";
import {
  Row,
  Button,
  Input,
  Divider,
  message,
  List,
  Typography,
  Tag,
} from "antd";
import {
  CopyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { onValue, get, child, ref, update } from "firebase/database";
import db, { DBService } from "./firebase.js";
import useLocalStorage from "./useLocalStorage";

function App() {
  const [loading, setLoading] = useState(true);
  const [gameKey, setGameKey] = useState(null);
  const [game, setGame] = useState(null);
  const [playerKey, setPlayerKey] = useLocalStorage("player", null);
  const [players, setPlayers] = useState({});
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(null);
  const [usedWords, setUsedWords] = useState({});

  const playerIsCreator = game?.creator === playerKey;
  const gameIsReady = game?.status === "ready";
  const gameIsActive = game?.status === "active";
  const gameIsComplete = game?.status === "complete";
  const timeRemaining = game?.timeRemaining;
  const characters = game?.characters;

  const results = useMemo(() => {
    const final = {};
    Object.entries(usedWords || {}).forEach(([word, playerKey]) => {
      final[playerKey] = (final[playerKey] || 0) + word.length;
    });

    return final;
  }, [usedWords]);

  const wordsByPlayer = useMemo(() => {
    const final = {};

    Object.entries(usedWords || {}).forEach(([word, playerKey]) => {
      if (!final[playerKey]) {
        final[playerKey] = [];
      }

      final[playerKey] = [...final[playerKey], word];
    });

    return final;
  }, [usedWords]);

  function initNewGame() {
    DBService.initGame(playerNameInput).then(({ gameKey, playerKey }) => {
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
      return "Already used!";
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
        error = "Only use letters once per word!";
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

  function startOver() {
    localStorage.removeItem("player");
    window.history.pushState({}, "", `/`);
    setGame(null);
    setPlayerKey(null);
    setPlayers(null);
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href).then(
      function () {
        message.success("Copied to clipboard!");
      },
      function () {
        message.error("Failed to copy to clipboard");
      }
    );
  }

  function handleAddPlayer() {
    if (!playerNameInput.length) {
      message.warning("You need a name to play!");
      return;
    }

    DBService.addPlayer(gameKey, playerNameInput).then((playerKey) =>
      setPlayerKey(playerKey)
    );
  }

  function handleWordInputChange(e) {
    const { value } = e.target;
    setInputValue(value.toLowerCase());

    if (!value.length) {
      setInputError(null);
    }
  }

  useEffect(() => {
    const path = window.location.pathname;

    if (path.includes("games")) {
      const gameKeyFromPath = path.split("/")[2];
      gameKeyFromPath && setGameKey(gameKeyFromPath);
    } else {
      localStorage.removeItem("player");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game) {
      setLoading(false);
    }
  }, [game]);

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

  const renderLoading = () => {
    return <LoadingOutlined style={{ fontSize: 50, color: "#1890ff" }} />;
  };

  const renderStartOverButton = () => {
    if (!playerIsCreator) return null;
    return (
      <Button style={{ marginTop: 100 }} danger onClick={startOver}>
        Start over
      </Button>
    );
  };

  const renderLandingScreen = () => {
    return (
      <>
        <h1>Welcome to WordDuet!</h1>
        <p>
          Race against the clock and each other to see who can come up <br />{" "}
          with more words with just nine random letters
        </p>
        <Divider />
        <Input
          size="large"
          value={playerNameInput}
          placeholder="Enter Your Name Here"
          onPressEnter={initNewGame}
          onChange={(e) => setPlayerNameInput(e.target.value)}
          style={{ maxWidth: 250, textAlign: "center" }}
        />
        <br />
        <br />
        <Button
          type="primary"
          onClick={initNewGame}
          size="large"
          shape="round"
          disabled={!playerNameInput.length}
        >
          Click to start a new game &nbsp; &rarr;
        </Button>
      </>
    );
  };

  const renderPreGame = () => {
    const notEnoughPlayers = Object.keys(players || {}).length < 2;

    function renderInvite() {
      return (
        <>
          <h2>Invite others with the link below</h2>
          <Input
            style={{ maxWidth: 350, fontSize: 10, textAlign: "center" }}
            value={window.location.href}
          />
          <br />
          <Button
            type="text"
            style={{ maxWidth: 350, width: "100%" }}
            onClick={copyShareLink}
          >
            <CopyOutlined /> Copy to clipboard
          </Button>
          <br />
          <Divider />
        </>
      );
    }

    function renderJoinGame() {
      return (
        <Input.Search
          size="large"
          value={playerNameInput}
          placeholder="Enter You Name Here"
          // onPressEnter={initNewGame}
          enterButton="Join game"
          onChange={(e) => setPlayerNameInput(e.target.value)}
          onSearch={handleAddPlayer}
          style={{ textAlign: "start", fontSize: 20, height: 55 }}
        />
      );
    }

    function renderUserItem([key, value]) {
      const isCurrentPlayer = key === playerKey;
      const isCreator = key === game.creator;

      return (
        <List.Item
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            backgroundColor: isCurrentPlayer ? "#e6f7ff" : null,
          }}
        >
          <div>
            <UserOutlined />
            &nbsp; <Typography.Text>{value}</Typography.Text>
          </div>
          {isCreator && !isCurrentPlayer && <i>Game creator</i>}
        </List.Item>
      );
    }

    function renderStartGameButton() {
      return (
        <Button
          block
          size="large"
          type="primary"
          onClick={startGame}
          disabled={notEnoughPlayers}
        >
          Start the game!
        </Button>
      );
    }

    return (
      <>
        {playerKey && renderInvite()}
        {!playerKey && renderJoinGame()}
        <br /> <br />
        <List
          bordered
          dataSource={Object.entries(players)}
          renderItem={renderUserItem}
        />
        {playerIsCreator ? (
          renderStartGameButton()
        ) : (
          <>
            <br />
            <h3>
              {notEnoughPlayers
                ? "At least two players needed to play"
                : `Waiting for ${players[game.creator]} to start the game...`}
            </h3>
          </>
        )}
        <br />
        {renderStartOverButton()}
      </>
    );
  };

  const renderCharacters = () => {
    const arrayOfChars = characters.split("");

    return (
      <Row justify="center">
        {arrayOfChars.map((char) => {
          return (
            <div
              key={char}
              style={{
                margin: "0px 10px",
                borderBottom: "2px solid #f2f2f2",
                padding: "0px 5px",
              }}
            >
              <h1 style={{ margin: 0 }}>{char.toUpperCase()}</h1>
            </div>
          );
        })}
      </Row>
    );
  };

  const renderActiveGame = () => {
    function renderWordInput() {
      return (
        <Input
          value={inputValue}
          size="large"
          onChange={handleWordInputChange}
          onPressEnter={handleSubmitWord}
          maxLength={9}
          style={{ textAlign: "center" }}
        />
      );
    }

    function renderSubmitButton() {
      return (
        <Button
          block
          size="large"
          type="primary"
          onClick={handleSubmitWord}
          disabled={!inputValue.length}
        >
          Submit <EnterOutlined />
        </Button>
      );
    }

    function renderWordItem([word, wordPlayerKey]) {
      return (
        <List.Item key={word}>
          <div>
            <Typography.Text
              mark={playerKey === wordPlayerKey}
              style={{
                fontSize: 20,
                letterSpacing: "0.1em",
                paddingRight: 10,
              }}
            >
              {word}
            </Typography.Text>
            <span style={{ color: "#87d068", fontSize: 16 }}>
              + {word.length}
            </span>
          </div>
          <Typography.Text
            style={{
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            {players[wordPlayerKey]}
          </Typography.Text>
        </List.Item>
      );
    }

    return (
      <>
        <h2>
          <ClockCircleOutlined />
          &nbsp; {timeRemaining} seconds
        </h2>
        <br />
        {renderCharacters()}
        <br />
        <h3 style={{ color: "red", height: 30 }}>{inputError || ""}</h3>
        {renderWordInput()}
        <br />
        {renderSubmitButton()}
        <br /> <br />
        {usedWords && (
          <List
            bordered
            dataSource={usedWords ? Object.entries(usedWords) : []}
            renderItem={renderWordItem}
          />
        )}
        {renderStartOverButton()}
      </>
    );
  };

  const renderCompleteGame = () => {
    const data = Object.entries(results).sort(([, a], [, b]) =>
      a > b ? -1 : 1
    );

    return (
      <>
        <h1>We have a winner!</h1>
        <List
          bordered
          dataSource={data}
          renderItem={([player, score]) => {
            const playerWords = wordsByPlayer[player];
            return (
              <List.Item
                key={player}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography.Text
                    mark={playerKey === player}
                    style={{
                      fontSize: 20,
                      letterSpacing: "0.1em",
                      paddingRight: 10,
                    }}
                  >
                    {players[player]}
                  </Typography.Text>

                  <Typography.Text
                    mark={playerKey === player}
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    {score}
                  </Typography.Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  {playerWords.map((word) => {
                    return <Tag key={word}>{word}</Tag>;
                  })}
                </div>
              </List.Item>
            );
          }}
        />

        {renderStartOverButton()}
      </>
    );
  };

  if (loading) return renderLoading();
  if (!game) return renderLandingScreen();
  if (gameIsReady) return renderPreGame();
  if (gameIsActive) return renderActiveGame();
  if (gameIsComplete) return renderCompleteGame();

  return renderLoading();
}

export default App;
