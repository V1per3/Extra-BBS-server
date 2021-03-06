
const router = require('koa-router')()
const role = require('../controller/role')

router
    .get('/', role.getRoleList)   //获取角色列表
    .post('/', role.addRole)   //添加角色
    .get('/:id', role.getRole)   //获取角色信息
    .del('/:id', role.deleteRole)   //删除角色
    .put('/:id', role.updateRole)   //修改角色信息

    .get('/access/:id', role.getRoleAccess)   //获取角色权限
    .put('/access/:id', role.updateRoleAccess)   //修改角色权限

module.exports = router