
const mysql = require('mysql')
const config = require('../config/config')

const pool = mysql.createPool({
  host: config.sql_host,
  user: config.sql_user,
  password: config.sql_password,
  database: config.sql_database,
  timezone: '08:00'
})

const query = ( sql, values ) => {

  return new Promise(( resolve, reject ) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log( err )
        resolve( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
         
          if ( err ) {
            console.log( err )
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })

}

module.exports = {
  query
}
