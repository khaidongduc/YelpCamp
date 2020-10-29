const Joi = require('./joiExtension');

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().min(1).max(5).required()
    }).required()
})

module.exports = reviewSchema;