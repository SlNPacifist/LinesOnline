explosionState = gamvas.State.extend({
    init: function() {
        // add emitter
        this.emitter = new explosionEmitter('boom', 0, 0);
        this.addActor(this.emitter);
        this.dim = gamvas.getCanvasDimension();
    },

    postDraw: function(t) {
        drawNextEffect(this.c);
        this.c.fillStyle = '#fff';
        this.c.font = 'bold 16px sans-serif';
        this.c.textAlign = 'right';
        this.c.fillText("Left mouse button for new explosion", this.dim.w-5, 20);
    },

    onMouseDown: function(b, x, y) {
        if (b == gamvas.mouse.LEFT) {
            // get our world coordinates of the mouse screen coordinates
            var wp = this.camera.toWorld(x, y);
            // update our emitter position
            this.emitter.setPosition(wp.x, wp.y);
            // update restart (whith old particles continuing to live)
            // if your want to force a reset, so old particles are
            // killed immediately, use reset(true)
            this.emitter.reset();
        }
    },

    // prevent browser scrolling on space
    onKeyDown: function(k) {
        return false;
    },

    // switch to rain state on space
    onKeyUp: function(k) {
        if (k == gamvas.key.SPACE) {
            gamvas.state.setState('rain');
        }
        return false;
    }
});

