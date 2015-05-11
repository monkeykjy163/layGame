/**
 * Created by monkey on 15/5/11.
 */
/*
 * 全局事件监听
 * CGlobalEvent().on(event, func.bind(this));
 *
 * 全局事件弹出
 * CGlobalEvent().emit(event, args...);
 */

(function(){
    var Emitter = null;
    this.CGlobalEvent = function()
    {
        if (Emitter == null)
        {
            Emitter = new EventEmitter();
        }

        return Emitter;
    };

    var ModelEmitter = null;
    this.CModelEvent = function()
    {
        if (ModelEmitter == null)
        {
            ModelEmitter = new EventEmitter();
        }

        return ModelEmitter;
    };

    var EventEmitter = function()
    {
        CUtils.emitter(this);

        //添加监听事件
        //this.on(event, func...);
    };

    this.CGlobalEmit = function(event, code, pid, id)
    {
        CGlobalEvent().emit(event, {code: code, pid: pid, id: id});
    };
})();
