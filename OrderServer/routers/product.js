const express = require('express')
const router = express.Router()

const chklogin        = require('../middleware/chklogin')
const asinitemController = require('../controllers/asinitem')

router.use(function timeLog (req, res, next) {
  // console.log('Time: ', Date.now())
  next()
})
router.get('/:storeid([\\w]{20,30})/:min([\\d]{0,10})/:max([\\d]{0,10})',chklogin,asinitemController.show)
router.post('/:storeid([\\w]{20,30})',chklogin,asinitemController.add)
router.patch('/updateprice/:storeid([\\w]{20,30})',chklogin,asinitemController.updateprice)
router.patch('/delete_item/:storeid([\\w]{20,30})',chklogin,asinitemController.delete)
router.patch('/delete_all/:storeid([\\w]{20,30})',chklogin,asinitemController.deleteinstore)
// router.patch('/updatedetail', chklogin,asinitemController.updatedetail)


module.exports = router
