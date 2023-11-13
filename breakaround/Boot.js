var BreakAround = {}
var BALL_VELOCITY = 200;
var BALL_SIZE = 23;

BreakAround.Boot = function () {}

BreakAround.Boot.prototype = {
    preload: function () {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = false;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        this.load.image('hotdog', 'assets/hotdog.png');
    },

    create: function () {
        this.state.start('BreakAround.Preload');
    }
}
