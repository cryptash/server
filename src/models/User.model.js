"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var bcrypt_1 = require("bcrypt");
var sequelize_1 = require("sequelize");
var jsonwebtoken_1 = require("jsonwebtoken");
var config = require("../config.json");
var db_connect_1 = require("../lib/db_connect");
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return User;
}(sequelize_1.Model));
User.init({
    username: { type: sequelize_1.DataTypes.TEXT },
    password: sequelize_1.DataTypes.TEXT,
    notified: sequelize_1.DataTypes.BOOLEAN,
    created_at: sequelize_1.DataTypes.TEXT,
    last_fetched: sequelize_1.DataTypes.TEXT,
    pub_key: sequelize_1.DataTypes.TEXT,
    picture_url: sequelize_1.DataTypes.TEXT,
    user_id: sequelize_1.DataTypes.TEXT,
    chats: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT)
}, { tableName: 'Users', sequelize: db_connect_1["default"] });
User.prototype.setPassword = function (pass) {
    this.password = bcrypt_1["default"].hashSync(pass, 10);
};
User.prototype.updatePassword = function (new_pass, old_pass) {
    if (!this.validatePassword(old_pass))
        return 403;
    this.password = bcrypt_1["default"].hashSync(new_pass, 10);
    return 200;
};
User.prototype.validatePassword = function (pass) {
    return bcrypt_1["default"].compareSync(pass, this.password);
};
User.prototype.generateJWT = function () {
    var today = new Date();
    var expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    return jsonwebtoken_1["default"].sign({
        username: this.username,
        user_id: this.user_id,
        exp: parseInt((expirationDate.getTime() / 1000).toString(), 10)
    }, config.secret);
};
User.prototype.toAuthJSON = function () {
    return {
        user_id: this.user_id,
        token: this.generateJWT()
    };
};
exports["default"] = User;
