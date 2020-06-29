const env = process.env.NODE_ENV || "development";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config/config")[env];
const User = require("../models/user");

const generateToken = (data) => {
  const token = jwt.sign(data, config.privateKey, {expiresIn: '1h'});

  return token;
};

const saveUser = async (req, res) => {
  const { username, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({
      username,
      password: hashedPassword,
    });

    const userObject = await user.save();
    const token = generateToken({
      userId: userObject._id,
      username: userObject.username,
    });

    res.cookie("aid", token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true });

    return token;
  } catch (err) {
    return {
      error: true,
      message: err,
    };
  }
};

const verifyUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return {
        error: true,
        message: "There is no such user!",
      };
    }

    const status = await bcrypt.compare(password, user.password);

    if (status) {
      const token = generateToken({
        userId: user._id,
        username: user.username,
      });

      res.cookie("aid", token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true });
    }

    return {
      error: !status,
      message: status || "Wrong password",
    };
  } catch (err) {
    return {
      error: true,
      message: "There is no such user!",
      status,
    };
  }
};

const authAccess = (req, res, next) => {
  const token = req.cookies["aid"];
  if (!token) {
    return res.redirect("/");
  }

  try {
    jwt.verify(token, config.privateKey);
    next();
  } catch (e) {
    return res.redirect("/");
  }
};

const authAccessJSON = (req, res, next) => {
  const token = req.cookies["aid"];
  if (!token) {
    return res.json({
      error: "Not authenticated",
    });
  }

  try {
    jwt.verify(token, config.privateKey);
    next();
  } catch (e) {
    return res.json({
      error: "Not authenticated",
    });
  }
};

const guestAccess = (req, res, next) => {
  const token = req.cookies["aid"];
  if (token) {
    return res.redirect("/");
  }
  next();
};

const getUserStatus = (req, res, next) => {
  const token = req.cookies["aid"];
  if (!token) {
    req.isLoggedIn = false;
  }

  try {
    jwt.verify(token, config.privateKey);
    req.isLoggedIn = true;
  } catch (e) {
    req.isLoggedIn = false;
  }

  next();
};

module.exports = {
  saveUser,
  verifyUser,
  authAccess,
  guestAccess,
  getUserStatus,
  authAccessJSON,
};
