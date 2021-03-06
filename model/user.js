

/**
 * 标识符（数据库、表、列名）用两个 ? 做占位符（即 ?? ）
 * 其他的用一个 ? 做占位符
 */

const util = require('../util')
const db = require('../util/db')
const db_mongo = require('../util/db_mongo')
const ObjectId = require('mongodb').ObjectId
const tokenUtil = require('../util/token')
const crypto = require('crypto')
const salt = require('../config/config').salt

const user = {

  //根据token获取用户角色id
  async getRoleId(){
    let obj = tokenUtil.parseToken()
    let id = obj.uid
    let sql = 'SELECT * FROM user WHERE id=?'
    let result = await db.query(sql, [id])
    if(Array.isArray(result) && result.length > 0){
      return result[0].role_id
    }
    return false
  },

  //查看用户列表
  async getUserList(roleId, pageNum, pageSize, keyword, status){
    let start = (pageNum-1) * pageSize
    let countSql
    let sql
    let countResult
    let result

    if(status == 2){

      countSql = `SELECT COUNT(*) 
                 FROM user AS u, role AS r 
                 WHERE u.role_id=r.id AND u.role_id>? AND u.name LIKE ?`

      sql = `SELECT u.id, u.name, u.account, u.avatar, u.bg, u.title, u.signature, u.sex, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name, u.status 
             FROM user AS u, role AS r 
             WHERE u.role_id=r.id AND u.role_id>? AND u.name LIKE ?
             ORDER BY u.id
             LIMIT ?,?`

      countResult = await db.query(countSql, [roleId, `%${keyword}%`])
      result = await db.query(sql, [roleId, `%${keyword}%`, start, pageSize])

    }else{

      countSql = `SELECT COUNT(*) 
                 FROM user AS u, role AS r 
                 WHERE u.role_id=r.id AND u.role_id>? AND u.name LIKE ? AND u.status=?`

      sql = `SELECT u.id, u.name, u.account, u.avatar, u.bg, u.title, u.signature, u.sex, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name, u.status 
             FROM user AS u, role AS r 
             WHERE u.role_id=r.id AND u.role_id>? AND u.name LIKE ? AND u.status=?
             ORDER BY u.id
             LIMIT ?,?`

      countResult = await db.query(countSql, [roleId, `%${keyword}%`, status])
      result = await db.query(sql, [roleId, `%${keyword}%`, status, start, pageSize])

    }
    if(Array.isArray(result) && result.length > 0){
      return {
        page_num: pageNum,
        page_size: pageSize,
        total: countResult[0]['COUNT(*)'],
        list: result
      }
    }
    return false
  },

  //新增用户
  async addUser(data){
    //默认新增普通用户
    let sql = 'INSERT INTO user(name, password, email, create_time, update_time, role_id) VALUES(?, ?, ?, ?, ?, ?)'
    let sha1Hash = crypto.createHash('sha1').update(data.password).digest('hex')
    let password = crypto.createHash('md5').update(salt + sha1Hash).digest('hex')
    let values = [
      data.name,
      password,
      data.email,
      util.changeTimeToStr(new Date()),
      util.changeTimeToStr(new Date()),
      data.role_id
    ]
    let result = await db.query(sql, values)
    if(result.insertId){
      return result.insertId
    }
    return false
  },

  //删除用户
  async deleteUser(id){
    // let sql = 'DELETE FROM user WHERE id=?'
    let sql = 'UPDATE user SET status=0 WHERE id=?'
    let result = await db.query(sql, [id])
    if(result.affectedRows){
      return true
    }
    return false
  },

  //获取用户信息(根据id)
  async getUser(id){
    let sql = `SELECT u.id, u.name, u.account, u.avatar, u.bg, u.title, u.signature, u.sex, u.fans, u.follows, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name 
               FROM user AS u, role AS r 
               WHERE u.role_id=r.id AND u.id=?`
    let result = await db.query(sql, [id])
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //获取用户信息(根据name)
  async getUserByName(name){
    let sql = `SELECT u.id, u.name, u.account, u.avatar, u.bg, u.title, u.signature, u.sex, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name 
               FROM user AS u, role AS r 
               WHERE u.role_id=r.id AND u.name=?`
    let result = await db.query(sql, [name])
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //获取用户信息(根据email)
  async getUserByEmail(email){
    let sql = `SELECT u.id, u.name, u.account, u.avatar, u.bg, u.title, u.signature, u.sex, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name 
               FROM user AS u, role AS r 
               WHERE u.role_id=r.id AND u.email=?`
    let result = await db.query(sql, [email])
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //获取用户信息(根据id)
  async getUserById(id){
    let sql = `SELECT u.id, u.name, u.account, u.password, u.avatar, u.bg, u.title, u.signature, u.sex, u.email, u.mobile, u.create_time, u.update_time, u.role_id, r.name AS role_name 
               FROM user AS u, role AS r 
               WHERE u.role_id=r.id AND u.id=?`
    let result = await db.query(sql, [id])
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //用户上传头像背景
  async upload(id, data){
    let sql = data.type == 1 ? 'UPDATE user SET avatar=? WHERE id=?' : 'UPDATE user SET bg=? WHERE id=?'
    let result = await db.query(sql, [data.url ,id])
    if(result.affectedRows){
      return true
    }
    return false
  },

  //修改用户信息
  async updateUser(id, data){
    let sql = 'UPDATE user SET name=?, account=?, title=?, signature=?, avatar=?, bg=?, sex=?, email=?, mobile=?, update_time=?, role_id=?, status=? WHERE id=?'
    let values = [
      data.name,
      data.account,
      data.title,
      data.signature,
      data.avatar,
      data.bg,
      data.sex,
      data.email,
      data.mobile,
      util.changeTimeToStr(new Date()),
      data.role_id,
      data.status
    ]
    let result = await db.query(sql, [...values, id])
    if(result.affectedRows){
      return true
    }
    return false
  },

  //修改用户自己的信息
  async updateSelf(id, data){
    let sql
    let values
    if(data.type == 'name'){
      sql = 'UPDATE user SET name=?, update_time=? WHERE id=?'
      values = [
        data.name,
        util.changeTimeToStr(new Date())
      ]
    }else{
      sql = 'UPDATE user SET signature=?, update_time=? WHERE id=?'
      values = [
        data.signature,
        util.changeTimeToStr(new Date())
      ]
    }
    let result = await db.query(sql, [...values, id])
    if(result.affectedRows){
      return true
    }
    return false
  },

  //修改用户密码
  async updateUserPwd(id, password){
    let sql = 'UPDATE user SET password=?, update_time=? WHERE id=?'
    let values = [
      password,
      util.changeTimeToStr(new Date())
    ]
    let result = await db.query(sql, [...values,id])
    if(result.affectedRows){
      return true
    }
    return false
  },

  //用户登录
  async login(email, password){
    let sql = 'SELECT password FROM user WHERE email=?'
    let result = await db.query(sql, [email])
    if(Array.isArray(result) && result.length > 0){
      let sha1Hash = crypto.createHash('sha1').update(password).digest('hex')
      let md5Hash = crypto.createHash('md5').update(salt + sha1Hash).digest('hex')
      if(result[0].password === md5Hash){
        return true
      }else{
        return false
      }
    }
    return false
  },

  //用户注册
  async register(data){
    //网站用户注册
    let sql = 'INSERT INTO user(name, email, password, create_time, update_time, role_id) VALUES(?, ?, ?, ?, ?, ?)'
    let sha1Hash = crypto.createHash('sha1').update(data.password).digest('hex')
    let password = crypto.createHash('md5').update(salt + sha1Hash).digest('hex')
    let values = [
      data.name,
      data.email,
      password,
      // data.email,
      util.changeTimeToStr(new Date()),
      util.changeTimeToStr(new Date()),
      5
    ]
    let result = await db.query(sql, values)
    if(result.insertId){
      return result.insertId
    }
    return false
  },

  //用户关注
  async follow(data){
    let dataObj = {
      uid: parseInt(global.uid),
      follow_uid: parseInt(data.follow_uid),
      create_time: util.changeTimeToStr(new Date()),
      state: 1
    }
    let result = await db_mongo.insertOne('user_fans_relation', dataObj)
    if(result.insertedCount){
      return result.insertedCount
    }
    return false
  },

  //获取用户关注记录
  async getFollow(uid, follow_uid){
    let result = await db_mongo.find('user_fans_relation', {uid, follow_uid})
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //修改用户关注状态
  async updateFollow(uid, follow_uid, state){
    let dataObj = {
      state
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_fans_relation', {uid, follow_uid}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //用户关注话题
  async followTopic(data){
    let dataObj = {
      uid: parseInt(global.uid),
      follow_topic_id: parseInt(data.follow_topic_id),
      create_time: util.changeTimeToStr(new Date()),
      state: 1
    }
    let result = await db_mongo.insertOne('user_topic_relation', dataObj)
    if(result.insertedCount){
      return result.insertedCount
    }
    return false
  },

  //获取用户关注话题记录
  async getFollowTopic(uid, follow_topic_id){
    let result = await db_mongo.find('user_topic_relation', {uid, follow_topic_id})
    if(Array.isArray(result) && result.length > 0){
      return result[0]
    }
    return false
  },

  //修改用户关注话题状态
  async updateFollowTopic(uid, follow_topic_id, state){
    let dataObj = {
      state
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_topic_relation', {uid, follow_topic_id}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //新增用户点赞收藏点亮数据模型
  async addUserLikeCollectLightModel(uid){
    let dataObj = {
      uid: parseInt(uid),
      like_posts: [],
      collect_posts: [],
      light_comments: [],
      light_answers: []
    }
    let result = await db_mongo.insertOne('user_likes_collects_lights_relation', dataObj)
    if(result.insertedCount){
      return result.insertedCount
    }
    return false
  },

  //删除用户点赞收藏点亮数据模型
  async deleteUserLikeCollectLightModel(uid){
    let result = await db_mongo.deleteOne('user_likes_collects_lights_relation', {uid: parseInt(uid)})
    if(result.deletedCount){
      return true
    }
    return false
  },

  //获取用户帖子点赞数组数据
  async getLikePost(uid){
    let result = await db_mongo.find('user_likes_collects_lights_relation', {uid})
    if(Array.isArray(result)){
      return result[0].like_posts
    }
    return false
  },

  //修改用户帖子点赞数组数据
  async updateLikePosts(uid, posts){
    let dataObj = {
      like_posts: posts
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_likes_collects_lights_relation', {uid}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //获取用户帖子收藏数组数据
  async getCollectPost(uid){
    let result = await db_mongo.find('user_likes_collects_lights_relation', {uid})
    if(Array.isArray(result)){
      return result[0].collect_posts
    }
    return false
  },

  //修改用户帖子收藏数组数据
  async updateCollectPosts(uid, posts){
    let dataObj = {
      collect_posts: posts
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_likes_collects_lights_relation', {uid}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //获取用户点亮评论数组数据
  async getLightComment(uid){
    let result = await db_mongo.find('user_likes_collects_lights_relation', {uid})
    if(Array.isArray(result)){
      return result[0].light_comments
    }
    return false
  },

  //修改用户点亮评论数组数据
  async updateLightComments(uid, comments){
    let dataObj = {
      light_comments: comments
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_likes_collects_lights_relation', {uid}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //评论点亮计数加一
  async increaseCommentLightsCount(commentId, lights){
    let dataObj = {
      lights: lights + 1
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('comment', {_id: ObjectId(commentId)}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //评论点亮计数减一
  async decreaseCommentLightsCount(commentId, lights){
    let dataObj = {
      lights: lights - 1
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('comment', {_id: ObjectId(commentId)}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //回复点亮计数加一
  async increaseAnswerLightsCount(answerId, lights){
    let dataObj = {
      lights: lights + 1
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('answer', {_id: ObjectId(answerId)}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //回复点亮计数减一
  async decreaseAnswerLightsCount(answerId, lights){
    let dataObj = {
      lights: lights - 1
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('answer', {_id: ObjectId(answerId)}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //获取用户点亮回复数组数据
  async getLightAnswer(uid){
    let result = await db_mongo.find('user_likes_collects_lights_relation', {uid})
    if(Array.isArray(result)){
      return result[0].light_answers
    }
    return false
  },

  //修改用户点亮回复数组数据
  async updateLightAnswers(uid, answers){
    let dataObj = {
      light_answers: answers
    }
    let setObj = {
      $set: dataObj
    }
    let result = await db_mongo.updateOne('user_likes_collects_lights_relation', {uid}, setObj)
    if(result.modifiedCount){
      return result.modifiedCount
    }
    return false
  },

  //获取用户关注话题记录
  async getUserTopic(uid, follow_topic_id){
    let result = await db_mongo.find('user_topic_relation', {uid, follow_topic_id})
    if(Array.isArray(result)){
      return result[0]
    }
    return false
  },

  //获取用户关注用户记录
  async getUserFollow(uid, follow_uid){
    let result = await db_mongo.find('user_fans_relation', {uid, follow_uid})
    if(Array.isArray(result)){
      return result[0]
    }
    return false
  },

  //更新用户统计
  async updateUserStatistics(id, action){
    /**
     * increaseFollows  增加关注数
     * decreaseFollows  减少关注数
     * increaseFans  增加粉丝数
     * decreaseFans  减少粉丝数
     */
    let sql = ''
    if(action == 'increaseFollows'){
      sql = 'UPDATE user SET follows=follows+1, update_time=? WHERE id=?'
    }else if(action == 'decreaseFollows'){
      sql = 'UPDATE user SET follows=follows-1, update_time=? WHERE id=?'
    }else if(action == 'increaseFans'){
      sql = 'UPDATE user SET fans=fans+1, update_time=? WHERE id=?'
    }else if(action == 'decreaseFans'){
      sql = 'UPDATE user SET fans=fans-1, update_time=? WHERE id=?'
    }else if(action == 'increaseLights'){
      sql = 'UPDATE user SET lights=lights+1, update_time=? WHERE id=?'
    }else if(action == 'decreaseLights'){
      sql = 'UPDATE user SET lights=lights-1, update_time=? WHERE id=?'
    }else{
      return false
    }
    let values = [
      util.changeTimeToStr(new Date())
    ]
    let result = await db.query(sql, [...values, id])
    if(result){
      return true
    }
    return false
  },

}

module.exports = user