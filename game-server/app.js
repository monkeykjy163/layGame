var pomelo = require('pomelo');
var area = require('./app/models/area');
var dataApi = require('./app/util/dataApi');
var fs = require('fs');
var path = require('path');
var utils = require('./app/util/utils');
var Monkey = require('../shared/');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'layGame');

app.configure('production|development', function() {
    // proxy configures
    // bufferMsg - 是否缓存消息 true/false
    // interval  - 刷新消息队列的时间间隔 xx ms
    // timeout - rpc 请求过期时间
    // 如果bufferMsg设置为true，后台会缓存消息，每interval的时间间隔刷新一次避免频繁的io调用
    app.set('proxyConfig', {
        bufferMsg: false,
        interval: 30
    });

    // remote configures
    // bufferMsg - 是否缓存消息 true/false
    // interval  - 刷新消息队列的时间间隔 xx ms
    // 如果bufferMsg设置为true，后台会缓存消息，每interval的时间间隔刷新一次避免频繁的io调用
    app.set('remoteConfig', {
        bufferMsg: false,
        interval: 30
    });

    var gameConfig = {};
    var dirname = path.resolve('..', 'shared/table');

    fs.readdirSync(dirname).forEach(function(filename) {
        if (!/\.csv$/.test(filename))
        {
            return;
        }

        var name = path.basename(filename, '.csv');
        try {
            var config = utils.loadCSV(path.join(dirname, filename));
            gameConfig[name] = config;
        }
        catch (e) {
            console.log(dirname + '/' + filename + ' config error!', e);
            process.exit(1);
        }

    });

    app.set('gameConfig', gameConfig);

    app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
});

// Configure database
app.configure('production|development', 'area', function() {
    var dbclient = require('./app/database/db').init(app);
    app.set('dbclient', dbclient);
});

app.configure('production|development', 'gate', function(){
  app.set('connectorConfig', {
      connector : pomelo.connectors.hybridconnector
  });
});

app.configure('production|development', 'connector', function(){
  app.set('connectorConfig', {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 100,
      useDict : true,
      useProtobuf : true
  });
});

app.configure('production|development', 'area', function(){
  var areaId = app.get('curServer').areaId;
  if (!areaId || areaId < 0) {
    throw new Error('load area config failed');
  }
  area.init(dataApi.area.findById(areaId));
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
