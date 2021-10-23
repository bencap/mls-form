const Club = require('./club.model');

require('./mongo').connect();

function getClubs(req, res) {
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

module.exports = {
  getClubs
};