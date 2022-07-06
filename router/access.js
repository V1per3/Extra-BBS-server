

const router = require('koa-router')()
const access = require('../controller/access')

router
    .get('/', access.getAccessList)   //获取权限列表
    .post('/', access.addAccess)   //添加权限
    .get('/:id', access.getAccess)   //获取权限信息
    .del('/:id', access.deleteAccess)   //删除权限
    .put('/:id', access.updateAccess)   //修改权限信息

module.exports = router