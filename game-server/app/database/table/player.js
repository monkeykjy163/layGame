/**
 * Created by monkey on 15/4/16.
 */
var async = require('async');
var zlib = require('zlib');
var crypto = require('crypto');
var utils = require('../../util/utils');
var pomelo = require('pomelo');
var logger = require(process.env.LOGGER_PATH + 'pomelo-logger').getLogger('pomelo', __filename);

var PlayerDB = module.exports;

PlayerDB.insert = function(player, cb)
{
    var sql = 'INSERT INTO player(uuid, uid, username, worldId) values (?, ?, ?, ?)';
    var args = [player.uuid, player.uid, player.username, player.worldId];
    var dbclient = pomelo.app.get('dbclient');

    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(cb, {code: err.number, msg: err.msg}, null);
        }
        else
        {
            var playerId = res.insertId;
            utils.invokeCallback(cb, null, playerId);
        }
    });
};

PlayerDB.queryByUserName = function(username, worldId, callback)
{
    var sql = 'SELECT uid, id, name from player where username = ? and worldId = ?';
    var args = [username, worldId];

    var dbclient = pomelo.app.get('dbclient');
    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(callback, {code: err.number, msg: err.msg}, null);
            return;
        }
        if (!!res && res.length > 0)
        {
            utils.invokeCallback(callback, null, res);
        }
        else
        {
            utils.invokeCallback(callback, null, null);
        }
    });
};

PlayerDB.query = function(uid, worldId, callback)
{
    var sql = 'SELECT * from player where uid = ? and worldId = ?';
    var args = [uid, worldId];

    var dbclient = pomelo.app.get('dbclient');
    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(callback, {code: err.number, msg: err.msg}, null);
            return;
        }

        if (!!res && res.length > 0)
        {
            async.parallel([
                function(cb) { zlib.gunzip(res[0].items, cb); },
                function(cb) { zlib.gunzip(res[0].immortals, cb); },
                function(cb) { zlib.gunzip(res[0].phantoms, cb); },
                function(cb) { zlib.gunzip(res[0].settings, cb); },
                function(cb) { zlib.gunzip(res[0].instances, cb); },
                function(cb) { zlib.gunzip(res[0].formation, cb); },
                function(cb) { zlib.gunzip(res[0].weights, cb); },
                function(cb) { zlib.gunzip(res[0].economy, cb); },
                function(cb) { zlib.gunzip(res[0].task, cb); },
                function(cb) { zlib.gunzip(res[0].energy_info, cb); },
                function(cb) { zlib.gunzip(res[0].vip, cb); },
                function(cb) { zlib.gunzip(res[0].normal, cb); },
                function(cb) { zlib.gunzip(res[0].newGuideData, cb); },
                function(cb) { zlib.gunzip(res[0].tower, cb); }

            ], function(err, results) {
                var playerId = parseInt(res[0].id);
                res[0].id = playerId;
                var player = new CPlayer(res[0]);
                var items = JSON.parse(results[0].length == 0 ? '{}' : results[0]);
                var immortals = JSON.parse(results[1].length == 0 ? '{}' : results[1]);
                var phantoms = JSON.parse(results[2].length == 0 ? '{}' : results[2]);
                var settings = JSON.parse(results[3].length == 0 ? '{}' : results[3]);
                var instances =  JSON.parse(results[4].length == 0 ? '{}' : results[4]);
                var formation = JSON.parse(results[5].length == 0 ? '{}' : results[5]);
                var weights = JSON.parse(results[6].length == 0 ? '{}' : results[6]);
                var economy = JSON.parse(results[7].length == 0 ? '{}' : results[7]);
                var task = JSON.parse(results[8].length == 0 ? '{}' : results[8]);
                var energy_info = JSON.parse(results[9].length == 0 ? '{}' : results[9]);
                var vip = JSON.parse(results[10].length == 0 ? '{}' : results[10]);
                var normal = JSON.parse(results[11].length == 0 ? '{}' : results[11]);
                var newGuideData = JSON.parse(results[12].length == 0 ? '{}' : results[12]);
                var tower = JSON.parse(results[13].length == 0 ? '{}' : results[13]);

                for (var id in items)
                {
                    var item = new CItem(items[id]);
                    player.items[id] = item;
                }

                for (var id in immortals)
                {
                    var immortal = new CImmortal(immortals[id]);
                    player.immortals[id] = immortal;
                }

                for (var id in phantoms)
                {
                    var phantom = new CPhantom(phantoms[id]);
                    player.phantoms[id] = phantom;
                }
                //console.log("===============",JSON.stringify(phantoms));
                //
                player.normal = normal;
                player.instances =  new CInstance(instances);
                economy.pid = playerId;
                player.economy = new CEconomy(economy);
                task.pid = playerId;
                player.task = new CTask(task);
                vip.pid = playerId;
                player.vip = new CVip(vip);

                player.energy_info = energy_info;
                player.settings = settings;
                player.formation = formation;
                player.weights = weights;
                player.newGuideData = newGuideData;
                player.tower = new CTower(tower);

                //console.log("=-=====================================");
                //console.log(JSON.stringify(task));
                utils.invokeCallback(callback, null, player);
            });
        }
        else
        {
            utils.invokeCallback(callback, null, null);
        }
    });
};

PlayerDB.banLogin = function(pair, callback)
{
    var block = { startTime: pair.start_time, endTime: pair.end_time, reason: pair.reason };
    var sql = "update player set block = ? where worldId = ? and id = ?";
    var args = [block, pair.server_id, pair.role_id];

    var dbclient = pomelo.app.get('dbclient');
    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(callback, {code: err.number, msg: err.msg}, null);
            return;
        }

        if (!!res && res.length > 0)
        {
            utils.invokeCallback(callback, null, res);
        }
        else
        {
            utils.invokeCallback(callback, null, null);
        }
    });
};

PlayerDB.unbanLogin = function(pair, callback)
{
    var block = null;
    var sql = "update player set block = ? where worldId = ? and id = ?";
    var args = [block, pair.server_id, pair.role_id];

    var dbclient = pomelo.app.get('dbclient');
    dbclient.query(sql, args, function(err, res) {
        if (err != null)
        {
            utils.invokeCallback(callback, {code: err.number, msg: err.msg}, null);
            return;
        }

        if (!!res && res.length > 0)
        {
            utils.invokeCallback(callback, null, res);
        }
        else
        {
            utils.invokeCallback(callback, null, null);
        }
    });
};
