const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");
const { newUserValidation } = require("../models/userValidator");
const newUserModel = require("../models/userModel");

router.post("/signup", async (req, res) => {
    const { error } = newUserValidation(req.body);
    console.log(JSON.stringify(error));
    if (error) {
        return res.status(400).send({ message: error.errors[0].message });
    }

    const { username, email, password, zipCode } = req.body;

    // check if username already exists
    const user = await newUserModel.findOne({ username: username });
    if (user) {
        return res.status(409).send({ message: "Username is taken, pick another" });
    }

    // generates the salt
    const generateHash = await bcrypt.genSalt(10);

    // hash the password
    const hashPassword = await bcrypt.hash(password, generateHash);

    // create a new user
    const createUser = new newUserModel({
        username: username,
        email: email,
        password: hashPassword,
        zipCode: zipCode,
    });

    try {
        const saveNewUser = await createUser.save();
        res.send(saveNewUser);
    } catch (error) {
        res.status(400).send({ message: "Error trying to create new user" });
    }
});

router.get("/debug/users", async (req, res) => {
    const users = await newUserModel.find();
    res.send(users);
});


module.exports = router;