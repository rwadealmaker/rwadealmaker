const express = require('express')
const ContactUs = express.Router()
const ContactUs_Handler = require('./route_handler/ContactUs_Handler')

// 邮箱验证
ContactUs.post('/contact', ContactUs_Handler.contact)

module.exports = ContactUs