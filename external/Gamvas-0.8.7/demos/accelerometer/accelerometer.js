motionState = gamvas.State.extend({
    init: function() {
        // set our graphic
		this.actor = new gamvas.Actor('actor');
		this.actor.center.x = 381/2;
		this.actor.center.y = 381/2;
		this.actor.setFile(this.resource.getImage('wheel.png'), 381, 381);
    },

    draw: function(t) {
        // draw it
        this.actor.draw(t);
    },

    onOrientation: function(alpha, beta, gamma) {
        // alpha is the rotation around z (as in a steering wheel) in degrees, centered on 180
        // note that the center is not on all devices on 180, you should always
        // give the user a way to calibrate its device and then calculate in the device
        // specific offset. For purpose of demonstration we keep it simple
        this.actor.setRotation(gamvas.math.degToRad((alpha-180)));
    }
});

gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new motionState('motiondemo'));
    gamvas.start('gameCanvas');
});
