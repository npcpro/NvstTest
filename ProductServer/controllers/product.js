const mg          = require('../mongo/mongodb')
const mongodb     = require('mongodb')
const ObjectID    = mongodb.ObjectID;
const superagent  = require('superagent')

exports.get = async (req,res) => {
        let rs = await mg.getData('product')
        res.send(rs)
}

exports.getOne = async (req,res) => {
          let _id = req.params._id
          let rs = await mg.getOne('product',{_id:ObjectID(_id)})
          res.send(rs)
}

exports.add = async (req,res) => {
        const data = req.body
        const rs = await mg.addData('product',data)
        res.send(rs)
}
