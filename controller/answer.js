
const answerService = require('../service/answer')
const util = require('../util')

const answer = {

  //获取评论回复列表
  async getAnswerList(ctx){
    let pageNum = ctx.query.page_num === undefined ? 1 : parseInt(ctx.query.page_num)
    let pageSize = ctx.query.page_size === undefined ? 20 : parseInt(ctx.query.page_size)
    let commentId = ctx.params.id === undefined ? 0 : ctx.params.id
    let answers = await answerService.getAnswerList(pageNum, pageSize, commentId)
    ctx.body = answers
  },

  //管理运营获取评论回复列表
  async getAnswerListForAdmin(ctx){
    let pageNum = ctx.query.page_num === undefined ? 1 : parseInt(ctx.query.page_num)
    let pageSize = ctx.query.page_size === undefined ? 20 : parseInt(ctx.query.page_size)
    let commentId = ctx.params.id === undefined ? 0 : ctx.params.id
    let answers = await answerService.getAnswerListForAdmin(pageNum, pageSize, commentId)
    ctx.body = answers
  },

  //添加评论回复
  async addAnswer(ctx){
    //验证数据
    let type = ctx.request.body.type
    if(type === undefined){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    let paramList = type == 1 ? ['type', 'pid', 'comment_id', 'targetor_id', 'content'] : ['type', 'pid', 'comment_id', 'target_answer_id', 'targetor_id', 'content']
    if(!util.checkParamExist(paramList, ctx.request.body)){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    let result = await answerService.addAnswer(ctx.request.body)
    ctx.body = result
  },

  //删除评论单条回复
  async deleteAnswer(ctx){
    //验证身份
    let result = await answerService.deleteAnswer(ctx.params.id)
    ctx.body = result
  },

  //获取评论单条回复信息
  async getAnswer(ctx){
    let result = await answerService.getAnswer(ctx.params.id)
    ctx.body = result
  },

  //查看回复详情相关信息
  async getAnswerDetail(ctx){
    let pageNum = ctx.query.page_num === undefined ? 1 : parseInt(ctx.query.page_num)
    let pageSize = ctx.query.page_size === undefined ? 20 : parseInt(ctx.query.page_size)
    let result = await answerService.getAnswerDetail(ctx.params.id, pageNum, pageSize)
    ctx.body = result
  },

  //修改评论回复信息
  async updateAnswer(ctx){
    //验证数据
    let paramList = ['content']
    if(!util.checkParamExist(paramList, ctx.request.body)){
      ctx.body = {
        status: 10002,
        message: '非法参数'
      }
      return
    }
    let result = await answerService.updateAnswer(ctx.params.id, ctx.request.body)
    ctx.body = result
  }

}

module.exports = answer