'use strict'

/**
 * herb service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::herb.herb')
