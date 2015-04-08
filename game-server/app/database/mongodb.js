/**
 * Created by monkey on 15/4/8.
 */

var pomelo = require('pomelo');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

var config = pomelo.app.get('mongodbConfig');

mongoose.connect(config.uri, config.options);

mongoose.connection.once('connected', function(){
    console.log('mongodb connected: ' + config.uri);
});

mongoose.connection.on('disconnected', function(err) {
    console.log('mongodb disconnected: ' + config.uri);
});

mongoose.connection.on('reconnected', function() {
    console.log('mongodb reconnected: ' + config.uri);
});

mongoose.connection.on('error', function(err) {
    console.log('mongodb connection error: %j', err);
});

module.exports = mongoose;

exports = module.exports;

//测试
exports.mdb_test = function () {
    var self = this;
    var table = "mdb_test";
    var fields = {
        name: {type: String, default: 'hahaha' },
        age: { type: Number, min: 18,default:22, index: true },
        date: { type: Date, default: Date.now }
    };
    var opts = {};
    self.createTable(table, fields, opts);
    //{age: {$gte: 10, $lte: 65}}
    self.query(table,{name:"Zsh"},function(err,result) {
        if(err){
            console.error("queryByWhere error --- ",err);
            return;
        }
        if(result && result.length > 0){
            console.log("queryWhere result ---",result);
            if(result.length == 1){
                console.log("update result---");
                var res = {};
                res['age'] = 2000;
                res['name'] = 'Zsh1';
                self.update(table,{name:"Zsh"},res, function (err,r) {
                    console.log("update==========",err,r);
                });
                return;
            }
            self.delete(table,{name:"Zsh"}, function (err,res) {
                console.error("========delete",err,res);
            });
            return;
        }
        //
        self.insert(table, {name: 'Zsh'}, function (err) {
            console.log("insert finished------------");
            if (err) {
                console.error("inser error---", err);
                return;
            }
            //
            self.query(table, {name: "Zsh"}, function (err, results) {
                if (err) {
                    console.error("query error----", err);
                    return;
                }
                //
                console.log("query OK ---", results);
            });
        });
    });

};


//init
//初始化
exports.init = function(app) {
    var config = app.get('mongodbConfig');
    var self = this;
    self.models = {};
    self.db = mongoose.createConnection(config['uri']);
    //console.log(config["table"]);
    //self.initModelFConf(config["table"]);
    //

    //create tables from js one by one
    var dirname = app.getBase() + '/app/database/mongoTables';

    fs.readdirSync(dirname).forEach(function(filename) {
        if (!/\.js$/.test(filename))
        {
            return;
        }

        var tableName = path.basename(filename, '.js');
        var pathName = path.join(dirname, filename);
        try {
            var dbJs = require(pathName);
            var fields = dbJs.getField();
            var opts = dbJs.getOpt();

            self.createTable(tableName, fields, opts);
        }
        catch (e) {
            console.log(dirname + '/' + filename + ' file error!');
            process.exit(1);
        }
    });

    self.db.on('error', function (error) {
        console.error("init mongoDB error----",error);
    });
    //
    self.db.on('open', function () {
    });
    return exports;
};

//设置model
exports.setModel = function (name,model) {
    this.models[name] = model;
};

//获取model
exports.getModel = function (name) {
    return this.models[name];
};

//初始化model
exports.initModelFConf = function (table) {
    for(var name in table){
        if(this.getModel(name)) continue;
        console.log("init mongoDB table --- ",name);
        this.createTable(name,table[name]['fields'],table[name]['options']);
    }
};

//创建表
//@param name 表名字
//@param fields: 表字段
//{
//    username : {type : String, default : '匿名用户'},
//    title    : {type : String},
//    content  : {type : String},
//    time     : {type : Date, default: Date.now},
//    age      : {type : Number}
//}
//@param opts
//@return table
//创建表
exports.createTable = function (name,fields,opts) {
    var schema = null;
    if(opts){
        schema =  new mongoose.Schema(fields,opts);
    }else{
        schema =  new mongoose.Schema(fields);
    }
    //
    var model = this.db.model(name,schema);
    this.setModel(name,model);
};


//查表
//where
//@param  where {age: {$gte: 21, $lte: 65}
//@param callback function
exports.query = function (table,where,callback) {
    var model = this.getModel(table);
    if(!model){
        console.error("not exists this model");
        return;
    }
    model.find(where,callback);
};

//查表并排序
//param sort [[a, -1], [b, 1]] 按a倒序，按b顺序
exports.querySort = function (table, where, sort, callback) {
    var model = this.getModel(table);
    if (!model)
    {
        console.error("not exists this model");
        return;
    }
    model.find(where, null, { sort: sort}, callback)
}

//count
//@param where
//@param callback
exports.count = function (table,where,callback) {
    var model = this.getModel(table);
    if(!model){
        console.error("not exists this model");
        return;
    }
    model.count(where,callback);
};


//增加数据
//@param table 表名字
//@param data 表内容
//@param callback = function(err)
exports.insert = function (table,data,callback) {
    var model = this.getModel(table);
    if(!model){
        console.error("not exists this model");
        return;
    }
    //
    new model(data).save(callback);
};

//更新数据
//@param where
//@param data
//@param callback function
exports.update = function (table,where,data,callback) {
    var model = this.getModel(table);
    if(!model){
        console.error("not exists this model");
        return;
    }
    model.update(where,{$set:data},{},callback);
};


//删除
exports.delete = function (table,where,callback) {
    var model = this.getModel(table);
    if(!model){
        console.error("not exists this model");
        return;
    }
    model.remove(where,callback);
};
