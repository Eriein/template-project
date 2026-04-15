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

  const navigate = useNavigate();

  const emojis = ["😀", "😎", "🔥", "✨", "🎉", "🚀", "💜", "👑", "😄", "🥳"];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const u = getUserInfo();
    setUser(u);
  }, []);

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
      <style>{`
        .fade-in {
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        className="vh-100 d-flex justify-content-center align-items-center"
        style={{
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <div className="fade-in">
          <Card
            className="text-center shadow-lg"
            style={{
              width: "22rem",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
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

              <h3 className="mb-1">{user.username}</h3>

              {/* Nickname display (UPDATED STYLE) */}
              {nickname && !isEditingNickname && (
                <p
                  style={{
                    opacity: 0.95,
                    fontSize: "1.6rem",   
                    fontWeight: "bold",   
                    marginTop: "10px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  “{nickname}”
                </p>
              )}

              {/* Nickname editor */}
              {isEditingNickname ? (
                <div className="my-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="form-control mb-2"
                  />

                  {/* Emoji Toggle */}
                  <Button
                    size="sm"
                    variant="outline-light"
                    className="mb-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    😀 Add Emoji
                  </Button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "10px",
                        justifyContent: "center",
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

              <div className="mt-4">
                <Button
                  className="w-100"
                  style={{ background: "#6c63ff", border: "none" }}
                  onClick={handleShow}
                >
                  Log Out
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Logout Modal */}
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
          centered
        >
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
      </div>
    </>
  );
};

export default PrivateUserProfile;