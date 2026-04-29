import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const PrivateUserProfile = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);

  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [times, setTimes] = useState([]);

  const navigate = useNavigate();

  const emojis = ["😀", "😎", "🔥", "✨", "🎉", "🚀", "💜", "👑", "😄", "🥳"];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /***********************
   * LOAD USER
   ***********************/
  useEffect(() => {
    const u = getUserInfo();
    setUser(u);
  }, []);

  /***********************
   * LOAD LEADERBOARD
   ***********************/
  useEffect(() => {
    if (!user) return;

    const fetchTimes = async () => {
      try {
        const res = await fetch(
          "http://localhost:8081/api/completion-times/getAll"
        );
        const data = await res.json();

        const filtered = data
          .filter((t) => t.user === user.username)
          .sort((a, b) => a.timeInSeconds - b.timeInSeconds)
          .slice(0, 10);

        setTimes(filtered);
      } catch (err) {
        console.error("Failed to load times:", err);
      }
    };

    fetchTimes();
  }, [user]);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const addEmoji = (emoji) => {
    setNickname((prev) => prev + emoji);
  };

  const saveNickname = () => {
    setIsEditingNickname(false);
    setShowEmojiPicker(false);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <h4>Please log in to view this page.</h4>
      </div>
    );
  }

  return (
    <>
      <div
        className="vh-100 d-flex justify-content-center align-items-center"
        style={{
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <Card
          className="text-center shadow-lg"
          style={{
            width: "28rem",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
          }}
        >
          <Card.Body>

            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#6c63ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {getInitials(user.username)}
            </div>

            <h3>{user.username}</h3>

            {/* Nickname Display */}
            {nickname && !isEditingNickname && (
              <p style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
                “{nickname}”
              </p>
            )}

            {/* Nickname Editor */}
            {isEditingNickname ? (
              <div className="my-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="form-control mb-2"
                />

                <Button
                  size="sm"
                  variant="outline-light"
                  className="mb-2"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😀 Add Emoji
                </Button>

                {showEmojiPicker && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      justifyContent: "center",
                      marginBottom: "10px",
                    }}
                  >
                    {emojis.map((emoji) => (
                      <span
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        style={{
                          cursor: "pointer",
                          fontSize: "20px",
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}

                <Button size="sm" className="me-2" onClick={saveNickname}>
                  Save
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingNickname(false);
                    setShowEmojiPicker(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline-light"
                className="mt-2"
                onClick={() => setIsEditingNickname(true)}
              >
                {nickname ? "Edit Nickname" : "Add Nickname"}
              </Button>
            )}

            {/* 🏆 LEADERBOARD */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "250px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "15px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <h5 style={{ marginBottom: "10px" }}>🏆 Top 10 Times</h5>

                {times.length === 0 ? (
                  <p>No times yet</p>
                ) : (
                  <ol
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {times.map((t, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "8px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.15)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontWeight: i < 3 ? "bold" : "normal",
                           color:
                              i === 0
                            ? "#ffd700" // gold
                            : i === 1
                            ?  "#d9d9ff"// silver
                            : i === 2
                            ? "#b87333" // bronze
                            : "white",
                        }}
                      >
                        <span>#{i + 1}</span>
                        <span>{t.timeInSeconds}s</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* Logout */}
            <Button
              className="w-100 mt-3"
              style={{ background: "#6c63ff", border: "none" }}
              onClick={handleShow}
            >
              Log Out
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* Logout Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you sure you want to log out?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PrivateUserProfile;