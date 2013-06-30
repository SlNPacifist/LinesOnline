rainState = gamvas.State.extend({
	init: function() {
        // create the emitter
        this.emitter = new rainEmitter('rain');
        this.addActor(this.emitter);
        this.dim = gamvas.getCanvasDimension();
        // disable screen clearing, as we draw a fullscreen image anyway
        this.autoClear = false;
        // get the background
        this.bg = new gamvas.Image(this.resource.getImage('media/rainbg.jpeg'));
	},

    preDraw: function(t) {
        // draw the background before camera is applied
        this.bg.draw(t);
    },

    postDraw: function(t) {
        // draw help after camera was applied
        drawNextEffect(this.c);
        this.c.fillStyle = '#fff';
        this.c.font = 'bold 16px sans-serif';
        this.c.textAlign = 'right';
        this.c.fillText(this.emitter.getParticleRate()+" Raindrops/s | Cursor UP/Down to double/half rain intensity", this.dim.w-5, 20);
    },

    // increase/decrease rain amount
    onKeyDown: function(k) {
        var pr = this.emitter.getParticleRate();
        if (k == gamvas.key.UP) {
            if (pr < 1600) {
                this.emitter.setParticleRate(this.emitter.getParticleRate()*2);
            }
        } else if (k == gamvas.key.DOWN) {
            if (pr > 10) {
                this.emitter.setParticleRate(this.emitter.getParticleRate()/2);
            }
        }
        return false;
    },

    // change to next state on space
    onKeyUp: function(k) {
        if (k == gamvas.key.SPACE) {
            gamvas.state.setState('smoke');
        }
        return false;
    }
});
