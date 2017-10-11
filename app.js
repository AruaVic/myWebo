var express=require('express');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var router=require('./router/router.js');


var app=express();
app.set('view engine','ejs');
app.use(express.static('./public'));
app.use("/avatar",express.static('./avatar'));

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(function(req,res,next){
    res.setHeader('content-type',"text/html;charset=utf8");
    next();
})


//路由表
app.get('/',router.showIndex);
app.get('/regist',router.showRegist);
app.post('/doregist',router.doRegist);
app.get('/login',router.showLogin);
app.post('/dologin',router.doLogin);
app.get('/setavatar',router.showAvatar);
app.post('/dosetavatar',router.dosetavatar);
app.post("/post",router.doPost);//发表说说
app.get("/getAllShuoshuo",router.getAllShuoshuo);//列出所有说说
app.get("/getUserInfo",router.getUserInfo);//根据用户名获取用户信息
app.get("/getshuoshuoamount",router.getshuoshuoamount);//说说总数
app.get("/user/:user",router.showUser);//显示用户的所有的说说
app.get("/userlist",router.showuserlist);//显示用户的所有用户列表


app.all("*",function(req,res,next){
    res.end("404");
})

app.listen(3000);