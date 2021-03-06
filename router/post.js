

const router = require('koa-router')()
const post = require('../controller/post')

router
    .get('/', post.getPostList)     //获取帖子列表
    .get('/admin', post.getPostListForAdmin)   //管理运营获取帖子列表
    .get('/hot', post.getHotPostList)   //获取热门帖子列表
    .get('/recommend', post.getRecommendPostList)   //获取推荐帖子列表
    .post('/', post.addPost)     //添加帖子
    .del('/:id', post.deletePost)   //删除帖子
    .get('/:id', post.getPost)    //获取帖子信息
    .put('/:id', post.updatePost)    //修改帖子信息

    .post('/add/pv', post.addPV)     //增加帖子阅读量

module.exports = router