const mg          = require('../mongo/mongodb')
const mongodb     = require('mongodb')
const ObjectID    = mongodb.ObjectID;
const superagent  = require('superagent')

exports.get = async (req,res) => {
        const userId = req.params.userId
        let rs = await mg.getData('order',{'user._id':userId})
        res.send(rs)
}

exports.add = async (req,res) => {
        try {
          const userId = req.params.userId
          const productId = req.params.productId
          const rs_userInfo    = await superagent.get(`http://localhost:3000/user/profile/${userId}`)
          const rs_productInfo = await superagent.get(`http://localhost:5000/product/one/${productId}`)
          const productInfo   = JSON.parse(rs_productInfo.text)
          const userInfo      = JSON.parse(rs_userInfo.text)
          const rs = await mg.addData('order',{user:userInfo,product:productInfo,status:'pendding'})
          res.send(rs)
        } catch (e) {
          console.log(e,'catch on add order');
          res.sendStatus(500)
        }
}
