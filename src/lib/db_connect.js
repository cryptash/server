"use strict";
exports.__esModule = true;
var sequelize_1 = require("sequelize");
var config = require("../config.json");
var conString = "postgres://" + config.db_user + ":" + config.db_pass + "@" + config.db_host + "/" + config.db_name;
exports["default"] = new sequelize_1.Sequelize(conString);
