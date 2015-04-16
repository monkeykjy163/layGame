/**
 * Created by monkey on 15/4/16.
 */
var async = require('async');
var zlib = require('zlib');
var logger = require(process.env.LOGGER_PATH + 'pomelo-logger').getLogger('pomelo', __filename);

module.exports =  {
    updatePlayer: function(client, val, cb) {
        var items = JSON.stringify(val.items);
        var immortals = JSON.stringify(val.immortals);
        var phantoms = JSON.stringify(val.phantoms);
        var settings = JSON.stringify(val.settings);
        var instances = JSON.stringify(val.instances);
        var formation = JSON.stringify(val.formation);
        var weights = JSON.stringify(val.weights);
        var economy = JSON.stringify(val.economy);
        var energyInfo = JSON.stringify(val.energy_info);
        var task = JSON.stringify(val.task);
        var vip = JSON.stringify(val.vip);
        var normal = JSON.stringify(val.normal);
        var newGuideData = JSON.stringify(val.newGuideData);
        var tower = JSON.stringify(val.tower);

        async.parallel([
            function(cb) { zlib.gzip(items, cb); },
            function(cb) { zlib.gzip(immortals, cb); },
            function(cb) { zlib.gzip(phantoms, cb); },
            function(cb) { zlib.gzip(settings, cb); },
            function(cb) { zlib.gzip(instances, cb); },
            function(cb) { zlib.gzip(formation, cb); },
            function(cb) { zlib.gzip(weights, cb); },
            function(cb) { zlib.gzip(economy, cb); },
            function(cb) { zlib.gzip(energyInfo, cb); },
            function(cb) { zlib.gzip(task, cb); },
            function(cb) { zlib.gzip(vip, cb); },
            function(cb) { zlib.gzip(normal, cb); },
            function(cb) { zlib.gzip(newGuideData, cb); },
            function(cb) { zlib.gzip(tower, cb); }

        ], function(err, results) {
            var sql = 'update player set exp = ?,name = ?, level = ?, image = ?, gold = ?, diamond = ?, energy = ?,maxEnergy = ?, items = ?, immortals = ?, phantoms = ?, settings = ?, instances = ?, formation = ?, weights = ?, economy = ? ,energy_info = ?,task = ?,vip = ?,normal = ?, newGuideData = ?, tower = ? where id = ?';
            var args = [
                val.exp,val.name, val.level, val.image, val.gold, val.diamond,
                val.energy,val.maxEnergy,results[0], results[1], results[2], results[3], results[4],
                results[5], results[6], results[7], results[8],results[9],results[10],results[11], results[12],
                results[13], val.id
            ];

            client.query(sql, args, function(err, res) {
                if (err !== null)
                {
                    logger.error('write mysql failed!　' + sql + ' ' + JSON.stringify(val) + ' stack:' + err.stack);
                }
                else
                {
                    logger.info('update mysql sucess! player=' + val.id + ' ' + JSON.stringify(res));
                }

                if (!!cb && typeof cb == 'function')
                {
                    cb(!!err);
                }
            });
        });
    }
};
