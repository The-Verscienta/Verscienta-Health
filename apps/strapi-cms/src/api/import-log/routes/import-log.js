'use strict';

/**
 * import-log router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::import-log.import-log');
