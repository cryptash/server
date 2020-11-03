"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var User_model_1 = require("../models/User.model");
var sequelize_1 = require("sequelize");
var jsonwebtoken_1 = require("jsonwebtoken");
var config = require("../config.json");
var searchUsers = function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var query, token, users, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(req);
                query = req.body.query.toLowerCase();
                if (query.length < 4)
                    return [2 /*return*/, {
                            statusCode: 400,
                            message: 'Query must be longer than 3',
                            error: 'Bad request'
                        }];
                token = jsonwebtoken_1["default"].verify(req.headers.authorization, config.secret);
                if (!token)
                    return [2 /*return*/, {
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Invalid token'
                        }];
                if (!req.body.user_id)
                    return [2 /*return*/, {
                            statusCode: 400,
                            error: 'Bad request',
                            message: "user_id can't be empty"
                        }];
                return [4 /*yield*/, User_model_1["default"].findAll({
                        where: {
                            username: sequelize_1["default"].where(sequelize_1["default"].fn('LOWER', sequelize_1["default"].col('username')), 'LIKE', '%' + query + '%')
                        }
                    })];
            case 1:
                users = _a.sent();
                result = [];
                users.map(function (user) {
                    result.push({
                        username: user.username,
                        user_id: user.user_id,
                        picture_url: user.picture_url
                    });
                });
                return [2 /*return*/, { statusCode: 200, data: { users: result, count: result.length } }];
        }
    });
}); };
exports["default"] = searchUsers;