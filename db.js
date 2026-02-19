const mysql = require("mysql2");

const conexao = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "GuSQL23@",
    database: "projeto_login"
});

module.exports = conexao.promise();
