/**
 * Created by monkey on 15/4/16.
 * "host"              : "127.0.0.1"
 * "port"              : "3306"
 * "user"              : "mysql user",
 * "password"          : "mysql password"
 * "database"          : "database name"
 * "charset"           : 'UTF8_GENERAL_CI',
 * "connectionLimit"   : 20,
 * "supportBigNumbers" : true,
 * "bingNumberStrings" : true,
 * "timezone"          : 'local',
 * "connectTimeout"    : 10,
 * "acquireTimeout"    : 10,
 * "waitForConnections" : true,
 * "queueLimit"        : 0
 */

var mysql = require('mysql');
var pool;

exports = module.exports;

exports.init = function(app) {
    var config = app.get('mysql');
    pool = mysql.createPool(config);

    return exports;
};

exports.release = function(connection) {
    connection.end(function(error) {
        console.log('Connection Closed');
    });
};

exports.query = function(sql, args, callback) {
    pool.getConnection(function(err, connection) {
        if (!!err) {
            console.error('[pool.acquire.err] ' + err.stack);
            return;
        }

        connection.query(sql, args, function(err, res) {
            connection.release(function(err)
            {
                if (!!err) {
                    console.error('[pool.release.err] ' + err.stack);
                }
            });

            if (!!err)
            {
                console.log('[mysql.query.err] ' + err.stack);
            }

            callback(err, res);
        });
    })
};
