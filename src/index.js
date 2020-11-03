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
var fastify_1 = require("fastify");
var ws_1 = require("ws");
var jsonwebtoken_1 = require("jsonwebtoken");
var db_connect_1 = require("./lib/db_connect");
var login_1 = require("./api/login");
var config = require("./config.json");
var send_1 = require("./api/messages/send");
var getKey_1 = require("./api/getKey");
var fastify_cors_1 = require("fastify-cors");
var register_1 = require("./api/register");
var searchUsers_1 = require("./api/searchUsers");
var checkAuth_1 = require("./api/checkAuth");
var getUserInfo_1 = require("./api/user/getUserInfo");
db_connect_1["default"].sync();
var port = config.port || 8080;
var clients = { server: { server: true } };
var server = fastify_1["default"]();
server.register(fastify_cors_1["default"], {
    origin: '*'
});
var wss = new ws_1["default"].Server({ server: server.server });
wss.on('connection', function connection(ws) {
    console.log('new connection');
    var token;
    ws.on('message', function incoming(message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                message = JSON.parse(message);
                if (message.action === 'register') {
                    token = jsonwebtoken_1["default"].verify(message.jwt, config.secret);
                    if (!token)
                        ws.send(JSON.stringify({
                            statusCode: 401,
                            error: 'Unauthorized',
                            message: 'Invalid token'
                        }));
                    clients[token.user_id] = {
                        user_id: token.user_id,
                        connection: ws,
                        isAlive: true
                    };
                    ws.send(JSON.stringify({
                        action: 'info',
                        data: {
                            statusCode: 200,
                            user_id: token.user_id,
                            message: 'Succesfull connection'
                        }
                    }));
                    console.log(clients);
                }
                if (message.action === 'send_message') {
                    delete message.action;
                    send_1["default"](clients, message);
                }
                return [2 /*return*/];
            });
        });
    });
    ws.on('pong', function () {
        clients[token.user_id].isAlive = true;
        console.log(token.user_id);
    });
});
var interval = setInterval(function ping() {
    Object.keys(clients).map(function (key) {
        var ws = clients[key];
        if (ws.server)
            return;
        if (!ws.isAlive) {
            ws.connection.terminate();
            delete clients[ws.user_id];
            return;
        }
        ws.isAlive = false;
        ws.connection.ping();
    });
}, 15000);
server.post('/api/login', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, login_1["default"](request, reply)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/register', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply).send;
                return [4 /*yield*/, register_1["default"](request, reply)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/getKey', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply).send;
                return [4 /*yield*/, getKey_1["default"](request, reply)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/searchUsers', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply).send;
                return [4 /*yield*/, searchUsers_1["default"](request)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/checkAuth', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply).send;
                return [4 /*yield*/, checkAuth_1["default"](request, reply)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/users/getInfo', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply).send;
                return [4 /*yield*/, getUserInfo_1["default"](request, reply)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
server.listen(port, function (err, address) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Server listening at " + address);
});
