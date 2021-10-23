const express = require('express');
const router = express.Router();
const clubService = require('./club.service');

router.get('/clubs', (req, res) => {
    clubService.getClubs(req, res);
//  res.send(200, [
//     {"id": 10, "name": "Starlord", "saying": "oh yeah"}
//  ])
});

module.exports=router;