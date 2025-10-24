'use strict';

/**
 * symptom service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::symptom.symptom');
