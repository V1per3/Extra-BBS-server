
//修改标准时间为日期时间字符串
const changeTimeToStr = (time) => {
  let year = time.getFullYear()  
  let month = time.getMonth()+1 < 10 ? "0"+(time.getMonth()+1) : time.getMonth()+1    
  let day = time.getDate() < 10 ? "0"+time.getDate() : time.getDate()    
  let hour = time.getHours() < 10 ? "0"+time.getHours() : time.getHours()       
  let minute = time.getMinutes() < 10 ? "0"+time.getMinutes() : time.getMinutes()     
  let second = time.getSeconds() < 10 ? "0"+time.getSeconds() : time.getSeconds()
  let newDate = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second     
  return newDate
}

//验证请求携带参数合法性
const checkParamExist = (paramList, reqParams) => {
  for(let index in paramList){
    if(!(paramList[index] in reqParams)){
      return false
    }
  }
  return true
}

module.exports = {
  changeTimeToStr,
  checkParamExist
}