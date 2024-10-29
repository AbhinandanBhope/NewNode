const Sequelize = require("sequelize");
const sequelize = require("./database");

const contactOrderItem = sequelize.define("contactOrderItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  productName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  productHSNCode: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  quantity: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = contactOrderItem;
