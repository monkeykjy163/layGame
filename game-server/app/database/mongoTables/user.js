/**
 * Created by monkey on 15/4/8.
 */

var fields =
{
    id: { type: Number, default: 0, index: true },
    uuid: { type: String, default: '' },
    name: { type: String, default: '', index: true },
    password: { type: String, default: '' },
    createTime: { type: Number, default: 0 },
    lastLogin: { type: Number, default: 0 },
    lastLogout: { type: Number, default: 0 }
};

var opt =
{
};

var exports = module.exports;
var MongoDB = require('../mongodb');
var utils = require('../../util/utils');

exports.getField = function() {
    return fields;
};

exports.getOpt = function() {
    return opt;
};

exports.insert = function(username, password, cb)
{
    var createTime = Date.now();
    var uuid = UUID.v4();
    var password = utils.md5(password);
    var data = { name: username,
        uuid: uuid,
        password: password,
        createTime: createTime,
        lastLogin: createTime };

    MongoDB.insert('user', data, function (err) {
        if (err)
        {
            utils.invokeCallback(cb, {code: err.number, msg: err.message }, null);
            return;
        }
        else
        {
            var user = new CUser({name: username, password: password, uuid: uuid, createTime: createTime, lastLogin: createTime});
            utils.invokeCallback(cb, null, user);
        }
    });
};

exports.query = function(username, cb)
{
    MongoDB.query('user', {name: username}, function (err, res) {
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

exports.update = function(data, cb)
{
    if (data.name == null)
    {
        console.error("update userdata but no userName", data);
        return;
    }

    MongoDB.update('user',{name: data.name}, data, function (err, res) {
        if (err != null)
        {
            utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
            return;
        }

        if (!!res && res.length > 0)
        {
            utils.invokeCallback(cb, null, new CUser({num: res}));
        }
        else
        {
            utils.invokeCallback(cb, 'user not exist', null);
        }
    });
};