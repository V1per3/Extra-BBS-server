
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const jwtKoa = require('koa-jwt')  // 用于路由权限控制
const app = new Koa()

const config = require('./config/config')

const tokenUtil = require('./util/token')
const router = require('./router')

const jwtUnless = require('./util/jwt_unless')  //用于判断是否需要jwt验证

//配置ctx.body解析中间件
app.use(bodyParser())

// 错误处理
app.use((ctx, next) => {
  //设置CORS跨域
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE")
  ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type, Authorization")
  ctx.set("Content-Type", "application/json;charset=utf-8")
  ctx.set("Access-Control-Expose-Headers", "new_token")
  //获取token，保存全局变量
  if(ctx.request.header.authorization){
    global.token = ctx.request.header.authorization.split(' ')[1]
    //检测当前token是否到达续期时间段
    let obj = tokenUtil.parseToken()
    //解析token携带的信息
    global.uid = obj.uid
    global.name = obj.name
    global.account = obj.account
    global.email = obj.email
    global.roleId = obj.roleId
    //先解析全局变量再执行next()，保证函数实时获取到变量值
  }
  return next().then(() => {
    //执行完下面中间件后进入
    //判断不需要jwt验证的接口，跳过token续期判断
    if(jwtUnless.checkIsNonTokenApi(ctx)) return
    //判断token是否应该续期（有效时间）
    if(tokenUtil.getTokenRenewStatus()){
      //设置header
      ctx.set({
        new_token: tokenUtil.createNewToken()
      })
    }
  }).catch((err) => {
      //携带token的Authorization参数错误
      if(err.status === 401){
          ctx.status = 200
          ctx.body = {
            status: 401,
            message: '未携带token令牌或者token令牌已过期'
          }
      }else{
          throw err
      }
  })
})

//配置不需要jwt验证的接口
app.use(jwtKoa({ secret: tokenUtil.secret }).unless({
  //自定义过滤函数，详细参考koa-unless
  custom: ctx => {
    if(jwtUnless.checkIsNonTokenApi(ctx)){
      //是不需要验证token的接口
      return true
    }else{
      //是需要验证token的接口
      return false
    }
  }
}));

//初始化路由中间件
app.use(router.routes()).use(router.allowedMethods())

//监听启动窗口
app.listen(config.port, () => console.log(`Extra BBS.server is run on ${config.host}:${config.port}`))