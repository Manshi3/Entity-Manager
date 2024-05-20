const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost', //change according to you server host for db
    user: 'root', //change use
    password: '@bhiStranger', //change password
    database: 'test' //Please keep db name test don't change it
});

module.exports = pool.promise();