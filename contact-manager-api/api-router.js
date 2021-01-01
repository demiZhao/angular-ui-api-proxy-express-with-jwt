const express = require('express');
const jwt = require('jsonwebtoken');
const checkJwt = require('express-jwt');

function apiRouter(database) {
  const router = express.Router();

  router.use(
    checkJwt({ secret: process.env.JWT_SECRET })
      .unless({ path: '/api/authenticate'})
  );

  router.get('/contacts', (req, res) => {
    return res.json(database.contacts.find())
  });

  router.post('/contacts', (req, res) => {
    const contact = req.body;

    const newContact = database.contacts.save(contact);

    res.status(201).json(newContact);
  });

  router.post('/authenticate', (req, res) => {
    const user = req.body;

    const result = database.users.find({ username: user.username })[0];

    if (!result) {
      return res.status(404).json({ error: 'user not found' });
    }

    if (user.password !== result.password) {
      return res.status(401).json({ error: 'incorrect password '});
    }

    const payload = {
      username: result.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });

    return res.json({
      message: 'successfuly authenticated',
      token: token
    });
  });

  return router;
}

module.exports = apiRouter;
