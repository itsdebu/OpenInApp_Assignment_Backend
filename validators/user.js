const Joi = require('joi')

const signUpValidator = Joi.object({
    phone_no: Joi.string().length(10).pattern(/^\d+$/).required(),
    priority: Joi.number().integer().valid(0, 1, 2).required(),
    password: Joi.string().min(8).required(),
})

const loginValidator = Joi.object({
    phone_no: Joi.string().length(10).pattern(/^\d+$/).required(),
    password: Joi.string().required(),
});

module.exports = { signUpValidator, loginValidator }