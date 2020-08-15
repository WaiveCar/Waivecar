module.exports = {
  sequelize : {
    host: 'waivecar-development.c9qxbaxup5ni.us-east-1.rds.amazonaws.com',
    //host: 'waivecar-development.c1zoem5venhu.us-east-2.rds.amazonaws.com',
    port: 3306,
    database : 'waivecar_development',
    username : 'admin',
    password : 'password',
    force    : false // this will delete the current database and create a new one
  }
};
