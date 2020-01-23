const express = require('express')
const router = express.Router()
const productController = require('../controllers/product')


router.get('/',productController.get)
router.get('/one/:_id',productController.getOne)
router.post('/',productController.add)

module.exports = router
