const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')

const chklogin        = require('../middleware/chklogin')


router.get('/',userController.get)
router.get('/profile/:_id',userController.getUserProfile)
router.post('/',userController.add)

module.exports = router
