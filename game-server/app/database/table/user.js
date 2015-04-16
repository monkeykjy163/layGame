/**
 * Created by monkey on 15/4/16.
 */

var async = require('async');
var UUID = require('uuid');
var crypto = require('crypto');
var utils = require('../../util/utils');
var pomelo = require('pomelo');
var logger = require(process.env.LOGGER_PATH + 'pomelo-logger').getLogger('pomelo', __filename);

var UserDB = module.exports;

UserDB.insert = function(username, password, cb)
{
    var sql = 'INSERT INTO user(name, password, uuid, createTime, lastLogin) values(?, ?, ?, ?, ?)';
    var createTime = Date.now();
    var uuid = UUID.v4();
    var password = utils.md5(password);
    var args = [username, password, uuid, createTime, createTime];
    var dbclient = pomelo.app.get('dbclient');

    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(cb, {code: err.number, msg: err.message }, null);
        }
        else
        {
            var user = new CUser({id: res.insertId, name: username, password: password, uuid: uuid, createTime: createTime, lastLogin: createTime});
            utils.invokeCallback(cb, null, user);
        }
    });
};


UserDB.query = function(username, cb)
{
    var sql = 'SELECT * FROM user where name = ?';
    var args = [username];
    var dbclient = pomelo.app.get('dbclient');

    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
            return;
        }

        if (!!res && res.length > 0)
        {
            utils.invokeCallback(cb, null, new CUser(res[0]));
        }
        else
        {
            utils.invokeCallback(cb, 'user not exist', null);
        }
    });
};

UserDB.update = function(user, cb)
{

};
