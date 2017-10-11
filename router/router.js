var formidable=require('formidable');
var db=require('../models/db.js');
var md5=require('../models/md5.js');
var path=require('path');
var fs=require("fs");


//显示首页
exports.showIndex=function(req,res,next){
    console.log(req.session.login,req.session.avatar);
    //检索数据库，已经登录就检索数据库查头像
    if(req.session.login =='1'){
        var username=req.session.username;
        var login=true;
    }else{
        var username="";
        var login=false;
    }
    db.find('users',{username:username},function(err,result){
        console.log("result.length = "+result.length);
        console.log(result);
        if(result.length==0){
            var avatar="moren.jpg";
        }else{
            var avatar=result[0].avatar
        }
        res.render('index',{
            "login":req.session.login == "1" ? true:false,
            "username":username,
            "active":"首页",
            "avatar":avatar//登录人的头像
        });

    });

};
//显示注册页
exports.showRegist=function(req,res,next){
    res.render('regist',{
        "login":req.session.login == "1" ? true:false,
        "username":req.session.login == '1'? req.session.username:null,
        "active":"注册"
    });
};
//注册业务
exports.doRegist=function(req,res,next){
    var form =new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        //得到用户填写的东西
        var username=fields.username;
        var password=fields.userpwd;
        var avatar=fields.avatar;
        console.log(username,password);
        //查询数据库中是否有这个人
        db.find('users',{"username":username},function(err,result){
            console.log(result);
            if(err){
                res.send("-3");//服务器错误
                return;
            }
            if(result.length!=0){
                res.send("-1");//被占用
                return;
            }
            //若没有则保存
            password=md5(md5(password)+md5(password)+"vic");
            db.insertOne('users',{
                "username":username,
                "password":password,
                "avatar":avatar
            },function(err,result){
                if(err){
                    res.send('-3');
                    return;
                }
                req.session.login="1";
                req.session.username=username;
                console.log("aaa:");
                console.log(req.session.login,req.session.username);
                console.log("aaaEnd:");
                res.send('1');
            })
        })

    })

}


//登录页面
exports.showLogin=function(req,res,next){
    res.render('login',{
        "login":req.session.login == "1" ? true:false,
        "username":req.session.login == '1'? req.session.username:null,
        "active":"登录"
    });
}
exports.doLogin=function(req,res,next){
    var form =new formidable.IncomingForm();
    form.parse(req,function(err,fields,files) {
        //得到用户填写的东西
        var username = fields.username;
        var password = fields.userpwd;
        console.log(username, password);
        db.find("users",{"username":username},function(err,result){
            console.log(result);
            if(err){
                res.send(-5);
                return;
            }
            if(result.length==0){
                res.send("-1");
            }
            var pwd=md5(md5(password)+md5(password)+"vic");
            if(pwd === result[0].password){
                req.session.login="1";
                req.session.username=username;
                res.send('1');
                return;
            }else{
                res.send("-2");
                return;
            }
        })
    });
};


//显示上传头像
exports.showAvatar =function(req,res,next){
    if(req.session.login!='1'){
        res.end("非法闯入，请登录！");
    }
    res.render('setavatar',{
        "login":true,
        "username" :req.session.username,
        "active":"上传头像"
    });
}


exports.dosetavatar=function(req,res,next){
    var form =new formidable.IncomingForm();
    form.uploadDir=path.normalize(__dirname + "/../" + "avatar");
    form.parse(req,function(err,fields,files){
        console.log(files);
        var oldname=files.touxiang.path;
        var newpath=path.normalize(__dirname+"/../avatar")+"/"+req.session.username+".jpg";
        fs.rename(oldname,newpath,function(err){
                    if(err){res.send("失败");return;}
                    req.session.avatar=req.session.username+".jpg";
                    //更改数据库当前用户的avatar这个值
                    db.updateMany("users",{"username":req.session.username},{
                        $set:{"avatar":req.session.avatar},function(err,result){
                            if(err){res.send("失败");return;}

                        }
                    });
                    //res.redirect("/");
                    res.send("上传成功!<script>setTimeout(function(){window.location.href='/'},5000)</script>");
                })
    })

}



/*发表说说*/
exports.doPost=function(req,res,next){
    if(req.session.login !=="1"){
        res.send("非法闯入，这个页面要求登录！");
        return;
    }
    var username=req.session.username;
    var form =new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        //得到用户填写的东西
        var content=fields.content;
        console.log(content);
        db.insertOne('posts',{
            "username":username,
            "datetime":new Date(),
            "content":content
        },function(err,result){
            if(err){
                res.send('-3');
                return;
            }
            res.send('1');
        })

    })

}
/*列出所有说说*/
exports.getAllShuoshuo=function(req,res,next){
    var page=req.query.page;
    db.find("posts",{},{"pageamount":5,"page":page},function(err,result){
        if(err){console.log(err);return;}
        res.json({"r":result});
    })
}

//获取用户信息
exports.getUserInfo=function(req,res,next){
    var username=req.query.username;
    db.find("users",{"username":username},function(err,result){
        if(err){console.log(err);return;}
        res.json({"r":result});
    })
}


//获取说说总数
exports.getshuoshuoamount=function(req,res,next){
    db.getAllCount("posts",function(err,count){
        if(err){console.log(err);return;}
        console.log(count);
        res.send(count);
    })
}

//显示个人主页
exports.showUser=function(req,res,next){
    var user=req.params["user"];
    db.find("posts",{"username":user},function(err,result){
        db.find("users",{"username":user},function(err,result2){
            res.render("user",{
                "login":req.session.login == "1" ? true:false,
                "username":req.session.login == '1'? req.session.username:null,
                "user":user,
                "active":"我的说说",
                "cirenshuoshuo":result,
                "cirentouxiang":result2[0].avatar
            })
        })

    })

}

//显示所有用户列表
exports.showuserlist=function(req,res,next){
    db.find("users",{},function(err,result){
        console.log(result);
        for(var i=0;i<result.length;i++){
            console.log(result[i].avatar);
            if(result[i].avatar==undefined||result[i].avatar==null){
                result[i].avatar="moren.jpg";
            }
        }
        res.render("userlist",{
            "login":req.session.login == "1" ? true:false,
            "username":req.session.login == '1'? req.session.username:null,
            "active":"成员列表",
            "suoyouchengyuan":result
        })
    })
}