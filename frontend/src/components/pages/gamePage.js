import React, { useEffect, useState, useRef } from "react";

/***********************
 * FUTURE API PLACEHOLDER
 ***********************/
async function fetchFlashcards() {
  const response = await fetch("http://localhost:8081/api/flashcards");
  const data = await response.json();
  return data;
}

const GamePage = () => {
  const [cards, setCards] = useState([]);
  const dragItem = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  /***********************
   * INIT DATA
   ***********************/
  useEffect(() => {
    const init = async () => {
      const data = await fetchFlashcards();

      const formatted = [];

      data.forEach((item, index) => {
        formatted.push(
          {
            key: `${item.id}-title`,
            id: item.id,
            type: "title",
            text: item.title,
            x: 50,
            y: 50 + index * 90
          },
          {
            key: `${item.id}-desc`,
            id: item.id,
            type: "description",
            text: item.description,
            x: 350,
            y: 50 + index * 90
          }
        );
      });

      setCards(formatted);
    };

    init();
  }, []);

  /***********************
   * DRAG HANDLERS
   ***********************/
  const handleMouseDown = (e, key) => {
    dragItem.current = key;

    const card = cards.find((c) => c.key === key);
    offset.current = {
      x: e.clientX - card.x,
      y: e.clientY - card.y
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
            y: e.clientY - offset.current.y
          }
          : card
      )
    );
  };

  const handleMouseUp = () => {
    dragItem.current = null;
  };

  /***********************
   * MATCH CHECK
   ***********************/
  const checkMatch = (cardA, cardB) => {
    if (cardA.id !== cardB.id) return false;
    if (cardA.type === cardB.type) return false;
    return true;
  };

  const handleDrop = (draggedCard) => {
    setCards((prev) => {
      const remaining = [...prev];

      const target = remaining.find(
        (c) =>
          c !== draggedCard &&
          Math.abs(c.x - draggedCard.x) < 80 &&
          Math.abs(c.y - draggedCard.y) < 80
      );

      if (target && checkMatch(draggedCard, target)) {
        return remaining.filter(
          (c) => c.key !== draggedCard.key && c.key !== target.key
        );
      }

      return prev;
    });
  };

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
        overflow: "hidden",
        position: "relative"
      }}
    >
      <style>{`
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

        .title {
          background: #e3f2fd;
        }

        .description {
          background: #fce4ec;
        }
      `}</style>

      {cards.map((card) => (
        <div
          key={card.key}
          className={`box ${card.type}`}
          style={{
            left: card.x,
            top: card.y
          }}
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