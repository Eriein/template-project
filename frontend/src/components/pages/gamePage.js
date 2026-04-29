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
   * UI FEEDBACK
   ***********************/
  const [shake, setShake] = useState(false);
  const prevWrongRef = useRef(0);

  useEffect(() => {
    if (wrongCount > prevWrongRef.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      prevWrongRef.current = wrongCount;
      return () => clearTimeout(t);
    }
    prevWrongRef.current = wrongCount;
  }, [wrongCount]);

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
    return (
      <div className="neon-loading">
        <style>{`
          .neon-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #0a0420;
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #ff00ff;
            text-shadow:
              0 0 10px #ff00ff,
              0 0 20px #ff00ff,
              0 0 40px #ff00ff;
            letter-spacing: 4px;
            animation: flicker 1.2s infinite alternate;
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
        LOADING...
      </div>
    );
  }

  /***********************
   * RENDER
   ***********************/
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily: "'Courier New', 'Consolas', monospace",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at top, #1a0a3e 0%, #0a0420 60%, #050210 100%)",
      }}
    >
      {/* STYLES — NEON ARCADE THEME */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@500;700;900&display=swap');

        /* Animated grid floor */
        body { margin: 0; }

        /* Scanline + grid background overlay */
        .neon-bg-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 0, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
        }

        .neon-bg-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 20% 30%, rgba(255, 0, 255, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.15) 0%, transparent 40%);
          z-index: 0;
        }

        .box {
          position: absolute;
          padding: 18px;
          border-radius: 6px;
          width: 180px;
          text-align: center;
          cursor: grab;
          user-select: none;
          font-family: 'Orbitron', 'Courier New', monospace;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 2;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .box:hover {
          transform: scale(1.04);
          z-index: 3;
        }
        .box:active {
          cursor: grabbing;
          transform: scale(1.06);
        }

        .title {
          background: linear-gradient(135deg, #1a0033 0%, #2d0052 100%);
          color: #00ffff;
          border: 2px solid #00ffff;
          box-shadow:
            0 0 8px #00ffff,
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 12px rgba(0, 255, 255, 0.15);
          text-shadow: 0 0 6px #00ffff;
          font-size: 14px;
        }
        .title:hover {
          box-shadow:
            0 0 14px #00ffff,
            0 0 36px rgba(0, 255, 255, 0.8),
            inset 0 0 18px rgba(0, 255, 255, 0.25);
        }

        .description {
          background: linear-gradient(135deg, #2a0033 0%, #4a0052 100%);
          color: #ff66ff;
          border: 2px solid #ff00ff;
          box-shadow:
            0 0 8px #ff00ff,
            0 0 20px rgba(255, 0, 255, 0.5),
            inset 0 0 12px rgba(255, 0, 255, 0.15);
          text-shadow: 0 0 4px #ff00ff;
          font-size: 13px;
          line-height: 1.5;
          font-family: 'Orbitron', 'Courier New', monospace;
          font-weight: 500;
        }
        .description:hover {
          box-shadow:
            0 0 14px #ff00ff,
            0 0 36px rgba(255, 0, 255, 0.8),
            inset 0 0 18px rgba(255, 0, 255, 0.25);
        }

        .hud {
          position: fixed;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-size: 14px;
          background: rgba(10, 4, 32, 0.85);
          padding: 14px 20px;
          border-radius: 4px;
          backdrop-filter: blur(6px);
          z-index: 10;
          letter-spacing: 1px;
        }

        .score {
          top: 16px;
          right: 24px;
          color: #00ffff;
          border: 2px solid #00ffff;
          box-shadow:
            0 0 10px #00ffff,
            0 0 25px rgba(0, 255, 255, 0.4),
            inset 0 0 10px rgba(0, 255, 255, 0.15);
          text-shadow: 0 0 6px #00ffff;
        }

        .wrong {
          top: 80px;
          right: 24px;
          color: #ff0055;
          border: 2px solid #ff0055;
          box-shadow:
            0 0 10px #ff0055,
            0 0 25px rgba(255, 0, 85, 0.4),
            inset 0 0 10px rgba(255, 0, 85, 0.15);
          text-shadow: 0 0 6px #ff0055;
          animation: pulse-red 1.5s infinite;
        }

        .timer {
          top: 144px;
          right: 24px;
          color: #ffea00;
          border: 2px solid #ffea00;
          box-shadow:
            0 0 10px #ffea00,
            0 0 25px rgba(255, 234, 0, 0.4),
            inset 0 0 10px rgba(255, 234, 0, 0.15);
          text-shadow: 0 0 6px #ffea00;
        }

        .wrong.shaking {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both,
                     flash-red 0.5s ease-out both;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-10px) rotate(-2deg); }
          20% { transform: translateX(10px) rotate(2deg); }
          30% { transform: translateX(-9px) rotate(-2deg); }
          40% { transform: translateX(9px) rotate(2deg); }
          50% { transform: translateX(-7px) rotate(-1deg); }
          60% { transform: translateX(7px) rotate(1deg); }
          70% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          90% { transform: translateX(-2px); }
        }

        @keyframes flash-red {
          0% {
            box-shadow:
              0 0 30px #ff0055,
              0 0 80px rgba(255, 0, 85, 1),
              inset 0 0 30px rgba(255, 0, 85, 0.5);
            background: rgba(255, 0, 85, 0.4);
          }
          100% {
            box-shadow:
              0 0 10px #ff0055,
              0 0 25px rgba(255, 0, 85, 0.4),
              inset 0 0 10px rgba(255, 0, 85, 0.15);
            background: rgba(10, 4, 32, 0.85);
          }
        }

        @keyframes pulse-red {
          0%, 100% {
            box-shadow:
              0 0 10px #ff0055,
              0 0 25px rgba(255, 0, 85, 0.4),
              inset 0 0 10px rgba(255, 0, 85, 0.15);
          }
          50% {
            box-shadow:
              0 0 20px #ff0055,
              0 0 50px rgba(255, 0, 85, 0.8),
              inset 0 0 20px rgba(255, 0, 85, 0.3);
          }
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(5, 2, 16, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .modal-box {
          background: linear-gradient(135deg, #1a0033 0%, #2d0052 100%);
          padding: 50px 60px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #00ffff;
          box-shadow:
            0 0 30px #00ffff,
            0 0 80px rgba(0, 255, 255, 0.5),
            inset 0 0 30px rgba(0, 255, 255, 0.1);
          font-family: 'Press Start 2P', 'Courier New', monospace;
        }

        .modal-box.lost {
          border-color: #ff0055;
          box-shadow:
            0 0 30px #ff0055,
            0 0 80px rgba(255, 0, 85, 0.5),
            inset 0 0 30px rgba(255, 0, 85, 0.1);
        }

        .modal-box h2 {
          color: #00ffff;
          font-size: 24px;
          margin: 0 0 24px 0;
          text-shadow:
            0 0 10px #00ffff,
            0 0 20px #00ffff;
          letter-spacing: 2px;
        }

        .modal-box.lost h2 {
          color: #ff0055;
          text-shadow:
            0 0 10px #ff0055,
            0 0 20px #ff0055;
        }

        .modal-box p {
          color: #ffea00;
          font-size: 14px;
          margin: 16px 0 28px 0;
          text-shadow: 0 0 6px #ffea00;
          letter-spacing: 1px;
        }

        button {
          margin-top: 10px;
          padding: 14px 28px;
          border: 2px solid #ff00ff;
          background: rgba(255, 0, 255, 0.1);
          color: #ff00ff;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-shadow: 0 0 6px #ff00ff;
          box-shadow:
            0 0 12px #ff00ff,
            0 0 24px rgba(255, 0, 255, 0.4),
            inset 0 0 12px rgba(255, 0, 255, 0.15);
          transition: all 0.2s ease;
        }

        button:hover {
          background: rgba(255, 0, 255, 0.25);
          box-shadow:
            0 0 20px #ff00ff,
            0 0 50px rgba(255, 0, 255, 0.8),
            inset 0 0 20px rgba(255, 0, 255, 0.3);
          transform: scale(1.05);
        }

        button:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Decorative background layers */}
      <div className="neon-bg-grid" />
      <div className="neon-bg-glow" />

      {/* HUD */}
      <div className="hud score">SCORE: {score}</div>
      <div className={`hud wrong${shake ? " shaking" : ""}`}>
        WRONG: {wrongCount}/{MAX_WRONG}
      </div>
      <div className="hud timer">
        {(elapsedTime / 1000).toFixed(1)}s
      </div>

      {/* WIN */}
      {phase === "won" && (
        <div className="modal">
          <div className="modal-box">
            <h2>ROUND CLEARED!</h2>
            <p>
              TIME: {(roundTime ? roundTime / 1000 : 0).toFixed(1)}s
            </p>
            <button onClick={startNewRound}>NEXT ROUND</button>
          </div>
        </div>
      )}

      {/* LOSS */}
      {phase === "lost" && (
        <div className="modal">
          <div className="modal-box lost">
            <h2>GAME OVER</h2>
            <p>FINAL SCORE: {score}</p>
            <button onClick={fullGameReset}>TRY AGAIN</button>
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
