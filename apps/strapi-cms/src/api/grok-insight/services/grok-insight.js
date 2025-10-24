'use strict';

/**
 * grok-insight service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::grok-insight.grok-insight');
