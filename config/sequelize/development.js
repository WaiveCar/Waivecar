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
   | _super : The system batch user use when there is no authorized actor
   |
   */

  sequelize : {
    database : 'waivecar_dev',
    username : 'waivecar',
    password : 'eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X'
  }

};