const  Sequelize  = require('sequelize');
const sequelize = require('./database');


const User = sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    name:Sequelize.STRING,
    
    email: {
        type:Sequelize.STRING,
        allowNull: false,
        unique: true, // Make Gmail column unique
      },
    password:{
        type: Sequelize.STRING,
  allowNull: false
    }
    ,
    
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    

    
    
    
});


module.exports = User;