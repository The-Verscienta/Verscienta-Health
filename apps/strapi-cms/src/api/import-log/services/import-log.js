'use strict';

/**
 * import-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::import-log.import-log');
