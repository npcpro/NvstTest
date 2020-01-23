const mg          = require('../mongo/mongodb')
const mongodb     = require('mongodb')
const ObjectID    = mongodb.ObjectID;

exports.login = async (req,res) => {
        console.log('model user login');
}

exports.get = async (req,res) => {
        let rs = await mg.getData('user')
        res.send(rs)
}

exports.getUserProfile = async (req,res) =>{
        let _id = req.params._id
        let rs = await mg.getOne('user',{_id:ObjectID(_id)})
        res.send(rs)
}

exports.add = async (req,res) => {
        const data = req.body
        const rs = await mg.addData('user',data)
        res.send(rs)

}
