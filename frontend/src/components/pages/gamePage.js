import React, { useEffect, useState, useRef } from "react";
/***********************
 * Full disclaimer: code is AI generated & human reviewed and
 * tested as in accordance to class policy and professor permission
 ***********************/

/***********************
 * API CALLS
 ***********************/
async function fetchFlashcards() {
  const response = await fetch("http://localhost:8081/api/flashcards");
  const data = await response.json();
  return data;
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
        key: `${item._id}-desc`,
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
  // ── Core game state ──────────────────────────────────────────
  const [cards, setCards] = useState([]);
  const [phase, setPhase] = useState("playing"); // 'playing' | 'firstWin' | 'gameOver'
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hasWonOnce, setHasWonOnce] = useState(false);

  // ── Drag state ───────────────────────────────────────────────
  const dragItem = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // ── Card loading ─────────────────────────────────────────────
  const loadCards = async () => {
    const data = await fetchFlashcards();
    setCards(formatCards(data));
  };
/* Start of adding stopwatch state*/
const [elapsedTime, setElapsedTime] = useState(0);
const [isRunning, setIsRunning] = useState(false);

const timerRef = useRef(null);
const startRef = useRef(0);
/* End of adding stopwatch state*/
/* Start of adding stopwatch reset*/
const resetTimer = () => {
  if (timerRef.current) clearInterval(timerRef.current);
  setElapsedTime(0);
  setIsRunning(false);
};
/* End of adding stopwatch reset*/

  // ── On mount: read username from localStorage and load cards ──
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Player";
    setUsername(storedUsername);
    loadCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Start of adding stopwatch load when cards load*/
useEffect(() => {
  if (cards.length > 0 && !isRunning) {
    startTimer();
  }
}, [cards]);
/* End of adding stopwatch load when cards load*/


  // ── Drag handlers ────────────────────────────────────────────
  const handleMouseDown = (e, key) => {
    dragItem.current = key;
    const card = cards.find((c) => c.key === key);
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

  // ── Match logic ──────────────────────────────────────────────
  const checkMatch = (cardA, cardB) =>
    cardA.id === cardB.id && cardA.type !== cardB.type;

  const handleDrop = (draggedCard) => {
    if (phase !== "playing") return;

    const target = cards.find(
      (c) =>
        c.key !== draggedCard.key &&
        Math.abs(c.x - draggedCard.x) < 80 &&
        Math.abs(c.y - draggedCard.y) < 80
    );

    if (!target) return; // dropped in empty space — no penalty

    if (checkMatch(draggedCard, target)) {
      // ✅ Correct match
      setScore((s) => s + POINTS_PER_MATCH);
      setCards((prev) =>
        prev.filter(
          (c) => c.key !== draggedCard.key && c.key !== target.key
        )
      );
    } else {
      // ❌ Wrong match
      setWrongCount((w) => w + 1);
    }
  };
/*Start of adding stopwatch logic*/
const startTimer = () => {
  setIsRunning(true);
  startRef.current = Date.now() - elapsedTime;

  timerRef.current = setInterval(() => {
    setElapsedTime(Date.now() - startRef.current);
  }, 1000);
};
/*End of adding stopwatch logic*/

  // ── React to wrong count reaching limit ──────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    if (wrongCount >= MAX_WRONG) {
      postScore(username, score);
      setPhase("gameOver");
    }
  }, [wrongCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to all cards being cleared ────────────────────────
  /*useEffect(() => {
    if (phase !== "playing") return;
    if (cards.length === 0) {
      if (!hasWonOnce) {
        // First time clearing the board — show "You Win!" modal
        setHasWonOnce(true);
        setPhase("firstWin");
      } else {
        // Endless mode — silently load a new round
        loadCards();
      }
    }
  }, [cards]); // eslint-disable-line react-hooks/exhaustive-deps*/
  
  /* I replaced the abouve commented out useEffect with the new one below*/
  useEffect(() => {
  if (phase !== "playing") return;

  if (cards.length === 0) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRunning(false);

    console.log("Round complete time:", elapsedTime);

    if (!hasWonOnce) {
      setHasWonOnce(true);
      setPhase("firstWin");
    } else {
      loadCards(); // next attempt
    }
  }
}, [cards, phase, elapsedTime, hasWonOnce]);

  // ── Modal actions ────────────────────────────────────────────
  const handleFirstWinPlayAgain = async () => {
    resetTimer(); // Only Stopwatch addition handleFirstWinPlayAgain
    await loadCards();
    setPhase("playing");
  };

  const handleGameOverPlayAgain = async () => {
    setScore(0);
    setWrongCount(0);
    setHasWonOnce(false);

    resetTimer(); // Only Stopwatch addition handleGameOverPlayAgain

    await loadCards();
    setPhase("playing");
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily: "Arial",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        /* ── Cards ──────────────────────────── */
        .box {
          position: absolute;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 10px;
          cursor: grab;
          width: 180px;
          text-align: center;
          user-select: none;
        }
        .title       { background: #e3f2fd; }
        .description { background: #fce4ec; }

        /* ── HUD ────────────────────────────── */
        .hud-score {
          position: fixed;
          top: 16px;
          right: 24px;
          font-size: 1.1rem;
          font-weight: bold;
          background: #fff;
          border: 2px solid #1976d2;
          border-radius: 8px;
          padding: 8px 18px;
          z-index: 100;
          color: #1976d2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /*stopwatch*/
        .hud-timer {
          position: fixed;
          top: 70px; /* this pushes it below score */
          right: 24px;
          font-size: 1.1rem;
          font-weight: bold;
          background: #fff;
          border: 2px solid #d4a017;
          border-radius: 8px;
          padding: 8px 18px;
          z-index: 100;
          color: #d4a017;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .hud-wrong {
          position: fixed;
          top: 16px;
          left: 24px;
          font-size: 1rem;
          font-weight: bold;
          background: #fff;
          border: 2px solid #e53935;
          border-radius: 8px;
          padding: 8px 18px;
          z-index: 100;
          color: #e53935;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ── Modal overlay ──────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          padding: 40px 48px;
          text-align: center;
          min-width: 320px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .modal h2 {
          margin: 0 0 8px;
          font-size: 2rem;
        }
        .modal p {
          margin: 0;
          font-size: 1rem;
          color: #555;
        }
        .modal .score-line {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1976d2;
          margin: 4px 0 12px;
        }
        .modal button {
          margin-top: 12px;
          padding: 12px 36px;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background: #1976d2;
          color: #fff;
          font-weight: bold;
          transition: background 0.15s;
        }
        .modal button:hover  { background: #1565c0; }
        .modal button:active { background: #0d47a1; }
      `}</style>

      {/* ── HUD (score + wrong count) ─────── */}
      <>
        <div className="hud-score">Score: {score}</div>
        <div className="hud-wrong">
          {"✗".repeat(wrongCount)}{"○".repeat(MAX_WRONG - wrongCount)}{" "}
          {wrongCount}/{MAX_WRONG}
        </div>
      </>
      
      {/* ── HUD for stopwatch ─────── */}
      <div className="hud-timer">
      Time: {(elapsedTime / 1000).toFixed(1)}s
      </div>
      
      {/* ── "You Win!" modal (first clear) ── */}
      {phase === "firstWin" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>You Win!</h2>
            <p>You matched all the cards!</p>
            <p className="score-line">Score: {score} | Time: {(elapsedTime / 1000).toFixed(1)}s</p>
            <button onClick={handleFirstWinPlayAgain}>Play Again?</button>
          </div>
        </div>
      )}

      {/* ── "Game Over!" modal ────────────── */}
      {phase === "gameOver" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p>You made {MAX_WRONG} wrong matches.</p>
            <p className="score-line">Final Score: {score}</p>
            <button onClick={handleGameOverPlayAgain}>Play Again?</button>
          </div>
        </div>
      )}

      {/* ── Cards ────────────────────────── */}
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