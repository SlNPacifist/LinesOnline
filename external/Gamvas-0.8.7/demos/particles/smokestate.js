smokeState = gamvas.State.extend({
    init: function() {
        // create two smoke emitters
        this.counter = 0;
        this.emitter = new smokeEmitter('smoke', -160, 200);
        this.emitter2 = new smokeEmitter('smoke2', 160, 200);

        this.addActor(this.emitter);
        this.addActor(this.emitter2);
    },

    postDraw: function(t) {
        this.counter += t;
        // move our second emitter in a sinus movement
        var offs = (this.counter*0.5)%(2*Math.PI);
        this.emitter2.setPosition(160+(Math.cos(offs)*80), 200);
        drawNextEffect(this.c);
    },

    // prevent browser scrolling on space
    onKeyDown: function(k) {
        return false;
    },

    // switch to next state on space
    onKeyUp: function(k) {
        if (k == gamvas.key.SPACE) {
            gamvas.state.setState('explosion');
        }
        return false;
    }
});
