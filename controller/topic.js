

const topicService = require('../service/topic')
const util = require('../util')

const topic = {

  //获取话题列表
  async getTopicList(ctx){
    let pageNum = ctx.query.page_num === undefined ? 1 : parseInt(ctx.query.page_num)
    let pageSize = ctx.query.page_size === undefined ? 20 : parseInt(ctx.query.page_size)
    let topics = await topicService.getTopicList(pageNum, pageSize)
    ctx.body = topics
  },

  //管理运营获取话题列表
  async getTopicListForAdmin(ctx){
    let pageNum = ctx.query.page_num === undefined ? 1 : parseInt(ctx.query.page_num)
    let pageSize = ctx.query.page_size === undefined ? 20 : parseInt(ctx.query.page_size)
    let topics = await topicService.getTopicListForAdmin(pageNum, pageSize)
    ctx.body = topics
  },

  //添加话题
  async addTopic(ctx){
    //验证数据
    let paramList = ['sid', 'name', 'intro', 'num', 'icon']
    if(!util.checkParamExist(paramList, ctx.request.body)){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    let result = await topicService.addTopic(ctx.request.body)
    ctx.body = result
  },

  //获取话题信息
  async getTopic(ctx){
    let result = await topicService.getTopic(parseInt(ctx.params.id))
    ctx.body = result
  },

  //删除话题
  async deleteTopic(ctx){
    //验证身份
    let result = await topicService.deleteTopic(parseInt(ctx.params.id))
    ctx.body = result
  },

  //修改话题信息
  async updateTopic(ctx){
    //验证数据
    let paramList = ['name', 'intro', 'icon', 'num', 'status']
    if(!util.checkParamExist(paramList, ctx.request.body)){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    if(ctx.request.body.status != 0 && ctx.request.body.status != 1){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    let result = await topicService.updateTopic(parseInt(ctx.params.id), ctx.request.body)
    ctx.body = result
  }

}

module.exports = topic