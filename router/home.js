
const router = require('koa-router')()

router.get('/', async(ctx) => {
  ctx.body = '403 forbidden'
})

module.exports = router