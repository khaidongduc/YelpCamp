const Joi = require('joi');

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required()
    }).required()
})

module.exports = reviewSchema;