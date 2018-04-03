const config = require("../../config/config"),
    logger = config.logger();

logger.debug('CardModel', require('../CardModel').model);

module.exports = require('../CardModel').model;