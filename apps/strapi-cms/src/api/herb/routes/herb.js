'use strict';

/**
 * herb router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::herb.herb');
