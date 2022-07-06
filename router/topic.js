
const router = require('koa-router')()
const topic = require('../controller/topic')

router
    .get('/', topic.getTopicList)   //获取话题列表
    .get('/admin', topic.getTopicListForAdmin)   //管理运营获取话题列表
    .post('/add', topic.addTopic)   //添加话题
    .get('/:id', topic.getTopic)   //获取话题信息
    .del('/:id', topic.deleteTopic)   //删除话题
    .put('/:id', topic.updateTopic)    //修改话题信息

module.exports = router