
var mongodb     = require('mongodb')
var MongoClient = mongodb.MongoClient;
var ObjectID    = mongodb.ObjectID;
const dbName    = 'user';
// const url       = `mongodb://localhost:27017/user`;
const url       = `mongodb://admin:zxcV1234@ds213079.mlab.com:13079/user`;

// mongodb://${config.host}:${config.port}/admin
const seedblog  = false;
  async function dbcon(){
    try {
      return await MongoClient.connect(url,{ useNewUrlParser: true ,useUnifiedTopology: true })
    } catch (e) {
      console.log(e,'catch connect');
      return false
    }
  }

  exports.dbcon = async () => {
          try {
            return await MongoClient.connect(url,{ useNewUrlParser: true })
          } catch (e) {
            if(seedblog)console.log(e);
            return false
          }
  }


  exports.getData = async (collection,filter = {},sort = {},limit = 0,skip = 0) =>{
                var db = await  dbcon()
                var dbo = await db.db(dbName);
                var rs  = await dbo.collection(collection).find(filter).toArray()
                return rs
  }

  exports.getOne = async (collection,filter = {}) =>{
                console.log(collection,filter,'getOne');
                var db = await  dbcon()
                var dbo = await db.db(dbName);
                var rs  = await dbo.collection(collection).findOne(filter)

                return rs
  }


  exports.addData = async (collection,data) => {
                console.log(collection,data,'insert one');
                var db = await  dbcon()
                var dbo = await db.db(dbName);
                var rs  = await dbo.collection(collection).insertOne(data)
                return rs
  }
