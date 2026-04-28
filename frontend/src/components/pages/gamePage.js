import React, { useEffect, useState, useRef } from "react";

/***********************
 * API CALLS
 ***********************/
async function fetchFlashcards() {
  const response = await fetch("http://localhost:8081/api/flashcards");
  return await response.json();
}

async function postScore(username, score) {
  await fetch("http://localhost:8081/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      score,
      date: new Date().toISOString(),
    }),
  });
}

async function postCompletionTime(user, timeInSeconds) {
  await fetch("http://localhost:8081/api/completion-times/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user,
      timeInSeconds,
    }),
  });
}

/***********************
 * HELPERS
 ***********************/
const MAX_WRONG = 3;
const POINTS_PER_MATCH = 1;

function formatCards(data) {
  const formatted = [];
  data.forEach((item, index) => {
    formatted.push(
      {
        key: `${item._id}-title`,
        id: item._id,
        type: "title",
        text: item.title,
        x: 50,
        y: 80 + index * 180,
      },
      {
        key: `${item._id}-description`,
        id: item._id,
        type: "description",
        text: item.description,
        x: index % 2 === 0 ? 550 : 750,
        y: 20 + index * 180 + 90,
      }
    );
  });
  return formatted;
}

/***********************
 * COMPONENT
 ***********************/
const GamePage = () => {
  /***********************
   * PHASE
   ***********************/
  const [phase, setPhase] = useState("idle");

  /***********************
   * SESSION STATE
   ***********************/
  const [cards, setCards] = useState([]);
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  /***********************
   * ROUND STATE
   ***********************/
  const [elapsedTime, setElapsedTime] = useState(0);
  const [roundTime, setRoundTime] = useState(null);

  /***********************
   * GUARD (NO DUPLICATES)
   ***********************/
  const submittedRef = useRef(false);

  /***********************
   * DRAG
   ***********************/
  const dragItem = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  /***********************
   * TIMER
   ***********************/
  const timerRef = useRef(null);
  const startRef = useRef(0);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    startRef.current = Date.now() - elapsedTime;

    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
  };

  useEffect(() => {
    if (phase === "playing") startTimer();
    else stopTimer();

    return () => stopTimer();
  }, [phase]);

  /***********************
   * LOAD CARDS
   ***********************/
  const loadCards = async () => {
    const data = await fetchFlashcards();
    return formatCards(data);
  };

  /***********************
   * ROUND START
   ***********************/
  const startNewRound = async () => {
    setPhase("loading");

    resetTimer();

    submittedRef.current = false;
    setRoundTime(null);

    const formatted = await loadCards();
    setCards(formatted);

    setPhase("playing");
  };

  /***********************
   * FULL RESET
   ***********************/
  const fullGameReset = async () => {
    setScore(0);
    setWrongCount(0);

    await startNewRound();
  };

  /***********************
   * INIT
   ***********************/
  useEffect(() => {
    const stored = localStorage.getItem("username") || "Player";
    setUsername(stored);

    fullGameReset();
  }, []);

  /***********************
   * WIN (IMPORTANT FLOW)
   ***********************/
  const handleWin = async () => {
    stopTimer();

    const finalTime = elapsedTime;
    setRoundTime(finalTime);

    setPhase("won");

    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      await postCompletionTime(
        username,
        Math.round(finalTime / 1000)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /***********************
   * LOSS
   ***********************/
  const handleLoss = () => {
    stopTimer();
    postScore(username, score);
    setPhase("lost");
  };

  /***********************
   * MATCH LOGIC
   ***********************/
  const checkMatch = (a, b) => a.id === b.id && a.type !== b.type;

  const handleDrop = (draggedCard) => {
    if (phase !== "playing") return;

    const target = cards.find(
      (c) =>
        c.key !== draggedCard.key &&
        Math.abs(c.x - draggedCard.x) < 80 &&
        Math.abs(c.y - draggedCard.y) < 80
    );

    if (!target) return;

    if (checkMatch(draggedCard, target)) {
      const newCards = cards.filter(
        (c) => c.key !== draggedCard.key && c.key !== target.key
      );

      setCards(newCards);
      setScore((s) => s + POINTS_PER_MATCH);

      if (newCards.length === 0) handleWin();
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);

      if (newWrong >= MAX_WRONG) handleLoss();
    }
  };

  /***********************
   * DRAG
   ***********************/
  const handleMouseDown = (e, key) => {
    dragItem.current = key;

    const card = cards.find((c) => c.key === key);
    if (!card) return;

    offset.current = {
      x: e.clientX - card.x,
      y: e.clientY - card.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragItem.current) return;

    setCards((prev) =>
      prev.map((card) =>
        card.key === dragItem.current
          ? {
              ...card,
              x: e.clientX - offset.current.x,
              y: e.clientY - offset.current.y,
            }
          : card
      )
    );
  };

  const handleMouseUp = () => {
    dragItem.current = null;
  };

  /***********************
   * LOADING
   ***********************/
  if (phase === "loading") {
    return <div style={{ textAlign: "center", marginTop: "40vh" }}>Loading...</div>;
  }

  /***********************
   * RENDER
   ***********************/
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily: "Arial",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* STYLES (CRITICAL - RESTORED) */}
      <style>{`
        .box {
          position: absolute;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 10px;
          width: 180px;
          text-align: center;
          cursor: grab;
          user-select: none;
        }

        .title { background: #e3f2fd; }
        .description { background: #fce4ec; }

        .hud {
          position: fixed;
          font-weight: bold;
          background: white;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .score { top: 16px; right: 24px; border: 2px solid #1976d2; }
        .wrong { top: 16px; left: 24px; border: 2px solid #e53935; }
        .timer { top: 70px; right: 24px; border: 2px solid #d4a017; }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-box {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        }

        button {
          margin-top: 10px;
          padding: 10px 20px;
          border: none;
          background: #1976d2;
          color: white;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      {/* HUD */}
      <div className="hud score">Score: {score}</div>
      <div className="hud wrong">
        Wrong: {wrongCount}/{MAX_WRONG}
      </div>
      <div className="hud timer">
        {(elapsedTime / 1000).toFixed(1)}s
      </div>

      {/* WIN */}
      {phase === "won" && (
        <div className="modal">
          <div className="modal-box">
            <h2>Round Completed!</h2>
            <p>
              Time: {(roundTime ? roundTime / 1000 : 0).toFixed(1)}s
            </p>
            <button onClick={startNewRound}>Next Round</button>
          </div>
        </div>
      )}

      {/* LOSS */}
      {phase === "lost" && (
        <div className="modal">
          <div className="modal-box">
            <h2>Game Over</h2>
            <p>Final Score: {score}</p>
            <button onClick={fullGameReset}>Try Again</button>
          </div>
        </div>
      )}

      {/* CARDS */}
      {cards.map((card) => (
        <div
          key={card.key}
          className={`box ${card.type}`}
          style={{ left: card.x, top: card.y }}
          onMouseDown={(e) => handleMouseDown(e, card.key)}
          onMouseUp={() => handleDrop(card)}
        >
          {card.text}
        </div>
      ))}
    </div>
  );
};

export default GamePage;