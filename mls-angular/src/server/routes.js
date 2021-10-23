const express = require('express');
const router = express.Router();
const clubService = require('./club.service');

router.get('/club', (req, res) => {
    clubService.getClub(req, res);
});
router.get('/club/:name', (req, res) => {
    clubService.getClubByName(req, res);
});
router.get('/club/fixture/:name', (req, res) => {
    clubService.getClubFixtures(req, res);
});
router.get('/stats', (req, res) => {
    clubService.getStats(req, res);
});
router.get('/stats/:name', (req, res) => {
    clubService.getClubStats(req, res);
});


module.exports = router;