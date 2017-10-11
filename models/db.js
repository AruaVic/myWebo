/*这个模块封装了所有对数据库的长用操作*/
var MongoClient=require('mongodb').MongoClient;
//不管数据库的什么操作，都要先连接数据库，我们可以吧来姐姐数据库风状成为颞部函数

function _connectDB(callback){
    var url='mongodb://localhost:27017/myWebo';
    MongoClient.connect(url,function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        console.log("数据库连接成功！");
        callback(err,db);
    })
}
init();
function init(){
    _connectDB(function(err,db){
        if(err){
            console.log(err);
            return;
        }
        db.collection("users").createIndex(
            {"username":1},
            null,
            function(err,results){
                if(err){console.log(err);return;}
                console.log("索引建立成功");
            }
        )
    })
}

exports.insertOne=function(collectionName , json , callback){
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result);
            db.close();
        })
    })
}

exports.find=function(collectionName,json,C,D){
    var result=[];//结果数组
    if(arguments.length == 3){
        var callback=C;
        var skipnumber=0;
        var limit=0;
    }else if(arguments.length == 4){
        var callback=D;
        var args=C;
        var skipnumber=args.pageamount * args.page;//应该省略的条数
        var limit=args.pageamount;//数目限制
    }else{
        throw new Error("find函数的参数个数必须是3个或者4个");
        return;
    }
    _connectDB(function(err,db){
        var cursor=db.collection(collectionName).find(json).skip(skipnumber).limit(limit);
        cursor.each(function(err,doc){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            if(doc != null){
                result.push(doc);
            }else{
                callback(null,result);
                db.close();
            }
        })
    })
}


//删除
exports.deletMany=function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).deleteMany(json,function(err,result){
            console.log(result);
            callback();
            db.close();
        })
    })
}
//更改
exports.updateMany=function(collectionName,json1,json2,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,function(err,result){
            callback(err,result);
            db.close();
        })
    })
}


exports.getAllCount=function(collectionName,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).find({}).count().exec(function(count){
            callback(count);
            db.close();
        });

    })
}