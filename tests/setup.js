const mongoose = require('mongoose');

const config = require('../config/keys');


mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI, {
    useMongoClient: true
});

require('../models/User');


jest.setTimeout(15000);
