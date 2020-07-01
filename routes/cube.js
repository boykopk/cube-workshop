const env = process.env.NODE_ENV || "development";

const express = require("express");
const jwt = require("jsonwebtoken");
const Cube = require("../models/cube");
const { authAccess, getUserStatus } = require("../controllers/user");
const { getCubeWithAccessories, getCube } = require("../controllers/cubes");
const config = require("../config/config")[env];
const router = express.Router();

router.get("/create", authAccess, getUserStatus, (req, res) => {
  res.render("create", {
    title: "Create Cube | Cube Workshop",
    isLoggedIn: req.isLoggedIn,
  });
});

router.post("/create", authAccess, async (req, res) => {
  const {
    name,
    description,
    imageUrl,
    difficultyLevel
} = req.body;

  const token = req.cookies["aid"];
  const decodedObject = jwt.verify(token, config.privateKey);

  const cube = new Cube({
    name: name.trim(),
    description: description.trim(),
    imageUrl,
    difficulty: difficultyLevel,
    creatorId: decodedObject.userId,
  });

  try {
    await cube.save();
    return res.redirect('/');
  } catch (err) {
    return res.render("create", {
        title: "Create Cube | Cube Workshop",
        isLoggedIn: req.isLoggedIn,
        error: 'Cube details are not valid!'
    });
  }
});

router.get("/details/:id", getUserStatus, async (req, res) => {
  const cube = await getCubeWithAccessories(req.params.id);

  res.render("details", {
    title: "Details | Cube Workshop",
    ...cube,
    isLoggedIn: req.isLoggedIn,
  });

});

router.get("/edit/:id", authAccess, getUserStatus, async (req, res) => {
  const cube = await getCube(req.params.id);

  const options = [
    { title: '1 - Very Easy', selected: 1 === cube.difficulty },
    { title: '2 - Easy', selected: 2 === cube.difficulty },
    { title: '3 - Medium (Standard 3x3)', selected: 3 === cube.difficulty },
    { title: '4 - Intermediate', selected: 4 === cube.difficulty },
    { title: '5 - Expert', selected: 5 === cube.difficulty },
    { title: '6 - Hardcore', selected: 6 === cube.difficulty }
  ];

  res.render("editCubePage", {
    ...cube,
    options,
    isLoggedIn: req.isLoggedIn
  });
});

router.get("/delete/:id", authAccess, getUserStatus, async (req, res) => {
  const cube = await getCube(req.params.id);

  const options = [
    { title: '1 - Very Easy', selected: 1 === cube.difficulty },
    { title: '2 - Easy', selected: 2 === cube.difficulty },
    { title: '3 - Medium (Standard 3x3)', selected: 3 === cube.difficulty },
    { title: '4 - Intermediate', selected: 4 === cube.difficulty },
    { title: '5 - Expert', selected: 5 === cube.difficulty },
    { title: '6 - Hardcore', selected: 6 === cube.difficulty }
  ];
  
  res.render("deleteCubePage", {
    ...cube,
    options,
    isLoggedIn: req.isLoggedIn
  });
});

router.post("/delete/:id", authAccess, async (req, res) => {
  const id = req.params.id;

  await Cube.findByIdAndDelete(id);

  res.redirect('/');
});

router.post("/edit/:id", authAccess, async (req, res) => {
  const { name, description, difficultyLevel, imageUrl } = req.body;
  const id = req.params.id;
  const difficulty = +difficultyLevel + 1;

  const newData = {};

  name && (newData.name = name);
  description && (newData.description = description);
  difficulty && (newData.difficulty = difficulty);
  imageUrl && (newData.imageUrl = imageUrl);

  await Cube.findByIdAndUpdate(id, newData);

  res.redirect('/');
});

module.exports = router;
