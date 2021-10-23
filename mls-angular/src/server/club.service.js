const Club = require('./club.model');

require('./mongo').connect();

function getClub(req, res) {
    const docquery = Club.find({});
    docquery
        .exec()
        .then(fixtures => {
            res.status(200).json(fixtures);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
        });
}

function getClubByName(req, res) {
    const docquery = Club.findOne({ club: req.params.name })
    docquery
        .exec()
        .then(fixtures => {
            res.status(200).json(fixtures);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
        });
}

function getClubFixtures(req, res) {
    const docquery = Club.findOne({ club: req.params.name })
    docquery
        .exec()
        .then(fixtures => {
            res.status(200).json(fixtures.scores);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
        });
}

function getStats(req, res) {
    const docquery = Club.find({ }).select("club GD xGD GA xGA GF xGF MP PF W D L")
    docquery.exec().then(fixtures => {
        res.status(200).json(fixtures);
    }).catch(error => {
        res.status(500).send(error);
        return;
    });
}

function getClubStats(req, res){
    const docquery = Club.findOne({ club: req.params.name }).select("club GD xGD GA xGA GF xGF MP PF W D L")
    docquery.exec().then(fixtures => {
        res.status(200).json(fixtures);
    }).catch(error => {
        res.status(500).send(error);
        return;
    });
}

module.exports = {
    getClub,
    getClubByName,
    getClubFixtures,
    getStats,
    getClubStats,
};