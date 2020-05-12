const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

// Sign up
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
    await user.save();
    sendWelcomeEmail(user.email, user.name);
  } catch (e) {
    res.status(400).send(e);
  }
});

// login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token }); // shorthand syntax for property definition
  } catch (e) {
    res.status(400).send();
  }
});

// log out
router.post('/users/logout', auth, async (req, res) => {
  try {
    // remove the current token from the array
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// log out all
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    // remove all the tokens from the array
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(
        new Error('Please upload an image file of type jpg, jpeg or png.')
      );
    }
    cb(undefined, true);
  },
});

// upload photo to account
router.post(
  '/users/me/avatar',
  auth, // auth middleware
  upload.single('avatar'), // file upload middleware
  // success method
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  // error method
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// update profile
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// get Avatar image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png'); // forcing to png with sharp
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

// delete profile
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    // res.status(400).send(e);
  }
});

module.exports = router;
