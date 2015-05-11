/**
 * Created by monkey on 15/5/11.
 */
/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');

var Monkey = module.exports = {};

Monkey.objects = {};
Monkey.consts = {};
Monkey.utils = {};

fs.readdirSync(__dirname + '/consts').forEach(function (filename) {
    if (!/\.js$/.test(filename)) {
        return;
    }
    var name = path.basename(filename, '.js');
    require('./consts/' + name);
});

fs.readdirSync(__dirname + '/utils').forEach(function (filename) {
    if (!/\.js$/.test(filename)) {
        return;
    }
    var name = path.basename(filename, '.js');
    require('./utils/' + name);
});

fs.readdirSync(__dirname + '/objects').forEach(function (filename) {
    if (!/\.js$/.test(filename)) {
        return;
    }

    if (filename == 'entity.js')
    {
        return;
    }

    var name = path.basename(filename, '.js');
    require('./objects/' + name);
});

function load(path, name) {
    if (name) {
        return require(path + name);
    }
    return require(path);
}
