const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order')


router.get('/:userId',orderController.get)
router.post('/:userId/:productId',orderController.add)

module.exports = router
