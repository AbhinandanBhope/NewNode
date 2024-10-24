require('dotenv').config();  // Load environment variables from .env file
const Sequelize = require('sequelize');
console.log(  process.env.DB_NAME,         // Database name
    process.env.DB_ROOT,         // Username (DB Root User)
    process.env.DB_PASS)

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,         // Database name
  process.env.DB_ROOT,         // Username (DB Root User)
  process.env.DB_PASS,         // Password
  {
    dialect: 'mysql',          // Database dialect
    host: process.env.DB_HOST, // Hostname
    port: process.env.DB_PORT || 3306, // Optional: Specify port (default is 3306)
    logging: false,            // Disable logging (optional)
    dialectOptions: {
      connectTimeout: 100000 // Increase the timeout (in milliseconds)
    },
         pool: {
      max: 10,                // Maximum number of connections
      min: 0,                 // Minimum number of connections
      acquire: 30000,         // Maximum time, in milliseconds, that pool will try to get connection before throwing error
      idle: 10000             // Maximum time, in milliseconds, that a connection can be idle before being released
    }
  
  
  }
);

// Export the sequelize instance for use in other modules
module.exports = sequelize;
