/**
 * Created by monkey on 15/4/30.
 */
(function(){
    var Player = this.CPlayer = function (opts) {
        this.id = opts.id;
        this.userName = opts.userName;
        this.name = opts.name || "菜鸟";
        this.gold = opts.gold || 0;
    };
})();