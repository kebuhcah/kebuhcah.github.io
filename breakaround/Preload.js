BreakAround.Preload = function (game) {
    this.preloadBar = null;
    this.ready = false;
}

BreakAround.Preload.prototype = {
    preload: function () {
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'hotdog');
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);

        this.load.path = 'assets/';
        this.load.images(['paddle', 'ball', 'emoji', 'background']);
        this.load.audio('point', ['point.wav']);
        this.load.audio('bounce', ['bounce.wav']);
        this.load.audio('death', ['death.wav']);
        this.load.audio('levelup', ['levelup.wav']);

    },

    create: function () {
        this.preloadBar.cropEnabled = false;
    },

    update: function () {
        if (this.cache.isSoundDecoded('point') &&
            this.cache.isSoundDecoded('bounce') &&
            this.cache.isSoundDecoded('death') &&
            this.cache.isSoundDecoded('levelup') && this.ready == false) {
            this.ready = true;
            this.state.start('BreakAround.Game');
        }
    }
}
