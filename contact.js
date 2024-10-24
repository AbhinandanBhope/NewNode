const  Sequelize  = require('sequelize');
const sequelize = require('./database');


const customerToContact= sequelize.define('customerToContact',{
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
      phoneNumber:{
        type: Sequelize.STRING,
  allowNull: false
    }
    ,
    message:{
        type: Sequelize.STRING,
  allowNull: true
    },
    
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    

    
    
    
});


module.exports = customerToContact;