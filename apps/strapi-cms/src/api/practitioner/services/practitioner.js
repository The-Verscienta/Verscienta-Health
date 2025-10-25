'use strict'

/**
 * practitioner service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::practitioner.practitioner')
