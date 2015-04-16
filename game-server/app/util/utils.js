var util = require('util');
var fs = require('fs');
var csv2array = require('csv2array');
var crypto = require('crypto');
var utils = module.exports;
var zlib = require("zlib");

//generate a random number between min and max
utils.rand = function (min, max) {
  var n = max - min;
  return min + Math.round(Math.random() * n);
};

// clone a object
utils.clone = function(origin) {
    if(!origin) {
        return;
    }

    var obj = {};
    for(var f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

//压缩
utils.compress = function (message,callback) {
    //
    zlib.gzip(new Buffer(JSON.stringify(message)), function(err, packet) {
        if (err) {
            console.error(err.stack);
        } else {
            if (packet.length > 8192) {
                console.error("Message packet length (" + packet.length + ") is larger than 8k. Not sending");
            }else {
                callback(packet);
            }
        }
    });
};


utils.md5 = function(str)
{
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb)
{
    if (!!cb && typeof cb === 'function')
    {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0;
    for(var f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

utils.loadCSV = function(path)
{
    var options = {
        headers: false,
        separator: ',',
        delimiter: '"'
    };

    var config = {};
    var retKeys = [];
    var initial = false;

    var data = fs.readFileSync(path, 'utf8');
    var records = csv2array(data, options);

    for (var i = 0; i < records.length; i++)
    {
        var record = records[i];
        /*
         if (record[0] == null)
         {
         continue;
         }

         if (record[0].length == 0)
         {
         continue;
         }
         */
        if (record[0][0].indexOf('#') != -1)
        {
            continue;
        }

        if (initial == false)
        {
            for (var k = 0; k < record.length; ++k)
            {
                var key = record[k];
                var keyName = key;
                var _lastIndex = key.indexOf('_');
                var valueType = "s";

                if(_lastIndex != -1){
                    valueType = key.substr(_lastIndex + 1);
                    keyName = key.substr(0, _lastIndex);
                }

                retKeys[k] = {};
                retKeys[k].key = key;
                retKeys[k].keyName = keyName;
                retKeys[k].valueType = valueType;
            }
            initial = true;
        }
        else
        {
            var key_n = 0;
            for (var k = 0; k < retKeys.length; ++k)
            {
                var valueType = retKeys[k].valueType;
                var keyName = retKeys[k].keyName;
                var valueString = record[k];

                if (valueString == null)
                {
                    continue;
                }

                switch (valueType)
                {
                    case 'kn':
                        key_n = valueString;
                        config[key_n] = {};
                        break;
                    case 'ks':
                        key_n = valueString;
                        config[key_n] = {};
                        break;
                    case 'n':
                        config[key_n][keyName] = Number(valueString);
                        break;
                    case 's':
                        config[key_n][keyName] = valueString;
                        break;
                    case 'b':
                        config[key_n][keyName] = Boolean(valueString);
                        break;
                    case 't':
                        if (valueString != '')
                        {
                            eval("config[key_n][keyName] = " + valueString);
                        }

                        break;
                }
            }
        }
    }

    return config;
};

// print the file name and the line number ~ begin
function getStack()
{
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack)
{
    return stack[1].getFileName();
}

function getLineNumber(stack)
{
    return stack[1].getLineNumber();
}

utils.print = function()
{
    var len = arguments.length;
    if(len <= 0) {
        return;
    }
    var stack = getStack();
    var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
    for(var i = 0; i < len; ++i) {
        aimStr += arguments[i] + ' ';
    }
    console.log('\n' + aimStr);
};