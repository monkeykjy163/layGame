/**
 * Created by monkey on 15/5/11.
 */

(function() {
    var Utils = this.CUtils = {};

    Utils.inherits = function(constructor, superConstructor) {
        function tempConstructor() {}
        tempConstructor.prototype = superConstructor.prototype;
        constructor.superClass_ = superConstructor.prototype;
        constructor.prototype = new tempConstructor();
        constructor.prototype.constructor = constructor;
    };

    Utils.getTemplate = function(name, id)
    {
        var table = CGetCSVField(name);
        if (table == null || table == undefined)
        {
            return null;
        }
        return table[id];
    };

    Utils.today = function () {
        return new Date()
    };
    Utils.seed = Utils.today().getTime();

    Utils.getNowSeconds = function () {
        return Math.floor(this.today().getTime() / 1000);
    };

    Utils.getNowMilliSeconds = function () {
        return this.today().getTime();
    };

    Utils.getZeroTime = function () {
        var date = this.today();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return (date.getTime() / 1000);
    };

    Utils.rnd = function()
    {
        Utils.seed = (Utils.seed.seed*9301+49297) % 233280;
        return Utils.seed.seed/(233280.0);
    };

    Utils.seed.random = function rand(number)
    {
        return Math.ceil(Utils.rnd()*number);
    };

    Utils.getRangeValue = function(min, max)
    {
        return Math.floor(Math.random()*(max - min) + min);
    };

    //随机数据
    //@param array
    //@param len 需要返回随机数组的长度
    Utils.rndArray = function (array,len) {
        if(!array) return [];
        var arr = array.slice();
        if(len <= 0 || arr.length < len ) return [];
        //if(arr.length == len) return arr;
        var index =0;
        var s ,out = [];
        for(var i = 0;i < len; i++){
            index = CUtils.getRangeValue(0,arr.length -1);
            s = arr.splice(index,1);
            out.push(s[0]);
        }
        return out;
    };

    //读取合适时间戳
    //@param timeArr 过滤数值
    Utils.readNextTime = function (timeArr) {
        var now = this.getNowSeconds();
        var next = 0;
        var i = 0;
        var j = 0;
        var day = false;
        //
        do{
            if(!timeArr[i]){
                day = true;
                j++;
                i = 0;
            }
            //
            if(day){
                next = timeArr[i] + TIME_DEF.DAY_PER_SECONDS * j;
            }else{
                next = timeArr[i];
            }
            i++;
            //
        }while(next < now);
        //
        return next;
    };

    //克隆对象
    Utils.copyArray = function(array) {
        if(!array) {
            return [];
        }

        if(!(array instanceof Array))
            return [];

        var ret = [];
        for(var i in array) {
            ret[i] = array[i];
        }
        return ret;
    };

    //自动补零
    Utils.intToString = function(val,zeroNum){
        var ret = "";
        var tmp = val;
        while(tmp > 0){
            var i = tmp % 10;
            ret = i + ret;
            tmp = Math.floor(tmp / 10);
        }

        while(ret.length < zeroNum){
            ret = 0 + ret;
        }

        return ret;
    };

    /**
     * clone an object
     */
    Utils.clone = function(obj) {
        var newObj = (obj.constructor) ? new obj.constructor : {};

        for (var key in obj) {
            var copy = obj[key];
            // Beware that typeof null == "object" !
            if (((typeof copy) == "object") && copy &&
                !(copy instanceof cc.Node) && !(copy instanceof HTMLElement)) {
                newObj[key] = cc.clone(copy);
            } else {
                newObj[key] = copy;
            }
        }
        return newObj;
    };

    Utils.size = function(obj) {
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

    Utils.isEmptyObject = function( obj ) {
        for ( var name in obj ) {
            return false;
        }
        return true;
    };

    Utils.isExitsFunction = function(funcName){
        try{
            if(typeof(eval(funcName))=="function"){
                return true;
            }
        }catch(e){
        }
        return false;
    };

    Utils.isExitsVariable = function(variableName){
        try{
            if(typeof(variableName)=="undefined"){
                return false;
            }else{
                return true;
            }
        }catch(e){
        }
        return false;
    };

    Utils.bezierAt = function (a, b, c, d, t) {
        return (Math.pow(1 - t, 3) * a +
        3 * t * (Math.pow(1 - t, 2)) * b +
        3 * Math.pow(t, 2) * (1 - t) * c +
        Math.pow(t, 3) * d );
    };

    var Emitter = function(obj) {
        if (obj) return mixin(obj);
    };

    Utils.emitter = Emitter;

    function mixin(obj) {
        for (var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
        }
        return obj;
    }

    Utils.emitterCount = 0;
    Utils.emitterLog = function(){
        //console.log("addEvents===========",Utils.emitterCount);
    };

    Emitter.prototype.on =
        Emitter.prototype.addEventListener = function(event, fn){
            this._callbacks = this._callbacks || {};
            (this._callbacks[event] = this._callbacks[event] || [])
                .push(fn);
            Utils.emitterCount++;
            Utils.emitterLog();
            return this;
        };

    Emitter.prototype.once = function(event, fn){
        var self = this;
        this._callbacks = this._callbacks || {};

        function on() {
            self.off(event, on);
            fn.apply(this, arguments);
        }

        fn._off = on;
        this.on(event, on);
        return this;
    };

    Emitter.prototype.off =
        Emitter.prototype.removeListener =
            Emitter.prototype.removeAllListeners =
                Emitter.prototype.removeEventListener = function(event, fn){
                    this._callbacks = this._callbacks || {};
                    var callbacks = this._callbacks[event];
                    if (!callbacks) return this;

                    // remove all handlers
                    if (1 == arguments.length) {
                        Utils.emitterCount -= this._callbacks[event].length;
                        delete this._callbacks[event];
                        Utils.emitterLog();
                        return this;
                    }

                    // remove specific handler
                    var i = callbacks.indexOf(fn._off || fn);
                    if (~i) callbacks.splice(i, 1);
                    if(~i) Utils.emitterCount--;
                    Utils.emitterLog();
                    return this;
                };

    Emitter.prototype.emit = function(event){
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1)
            , callbacks = this._callbacks[event];

        if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
            }
        }

        return this;
    };

    Emitter.prototype.listeners = function(event){
        this._callbacks = this._callbacks || {};
        return this._callbacks[event] || [];
    };

    Emitter.prototype.hasListeners = function(event){
        return !! this.listeners(event).length;
    };
})();
