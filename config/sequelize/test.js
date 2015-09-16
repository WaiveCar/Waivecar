module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Sequelize
   |--------------------------------------------------------------------------------
   |
   | host     : Server address
   | database : Name of the database to connect to
   | username : The username to use for the connection
   | password : The password to use for the connection
   | dialect  : mysql | mariadb | sqlite | postgres | mssql
   | pool     : Connection pool settings
   |   max  : Max number of active pools 
   |   min  : Min number of pools
   |   idle : Idle setting
   | debug  : Log sequelize output to the terminal
   | force  : Drop all the tables when syncing tables
   |
   */

  sequelize : {
    database : 'waivecar_test',
    username : 'root',
    force    : true
  }

};