import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const PRIMARY_COLOR = "#cc5c99";
const SECONDARY_COLOR = "#0c0c1f";
const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/user/signup`;

const Register = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    zipCode: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState("Light Mode");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    if (light) {
      setBgColor("white");
      setBgText("Dark mode");
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText("Light mode");
    }
  }, [light]);

  let labelStyling = {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };

  let backgroundStyling = { background: bgColor };

  let buttonStyling = {
    background: PRIMARY_COLOR,
    borderStyle: "none",
    color: bgColor,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(url, data);

      window.alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section className="vh-100">
      <div className="container-fluid h-custom vh-100">
        <div
          className="row d-flex justify-content-center align-items-center h-100"
          style={backgroundStyling}
        >
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label style={labelStyling}>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={data.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
                <Form.Text className="text-muted">
                  We just might sell your data
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label style={labelStyling}>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="Enter Email Please"
                  required
                />
                <Form.Text className="text-muted">
                  We just might sell your data
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label style={labelStyling}>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={data.password}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formZipcode">
                <Form.Label style={labelStyling}>ZIP Code</Form.Label>
                <Form.Control
                  type="text"
                  name="zipCode"
                  value={data.zipCode}
                  onChange={handleChange}
                  placeholder="Enter your ZIP Code"
                  required
                />
                <Form.Text className="text-muted">
                  Used to find nearby cinemas for your account
                </Form.Text>
              </Form.Group>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="flexSwitchCheckDefault"
                  onChange={() => {
                    setLight(!light);
                  }}
                />
                <label
                  className="form-check-label text-muted"
                  htmlFor="flexSwitchCheckDefault"
                >
                  {bgText}
                </label>
              </div>

              {error && (
                <div style={labelStyling} className="pt-3">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                style={buttonStyling}
                className="mt-2"
              >
                Register
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;