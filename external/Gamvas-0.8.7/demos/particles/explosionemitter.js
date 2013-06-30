explosionEmitter = gamvas.ParticleEmitter.extend({
    // overwrite constructor
	create: function(name, x, y, img, anim) {
        // call super constructor
		this._super(name, x, y, img, anim);

        // load the fire image, centered
		var st = gamvas.state.getCurrentState();
		var fireimg = new gamvas.Image(st.resource.getImage('media/fire.png'));
		fireimg.setCenter(32, 32);
		this.setImage(fireimg);

        // stop after 25 particles are emitted
        this.setParticleLimit(25);

        // emit 300 particles per second with the limit of 25
        // this emitter will emit 1/12 of a second
        this.setParticleRate(300);

        // emitt in all directions
        this.setRotationRange(2*Math.PI);

        // set random rotation
        this.setParticleRotationRange(2*Math.PI);
        // continue rotation in a slow speed
        this.setParticleRotationVelocityRange(0.5);
        // emit with 100-200 pixels per second (150 + range of +/- 50)
        this.setParticleSpeed(150);
        this.setParticleSpeedRange(50);
        // fade quickly in to alpha of 0.4, then slowly out to 0
        this.setAlphaTable([ [0.0, 0.0], [0.03, 0.4], [1.0, 0.0]]);
        // quickly scale to 70% size, then at 70% lifetime get 100% size
        // the rest 30% until death, scale to zero
        this.setScaleTable([ [0.0, 0.0], [0.1, 0.7], [0.7, 1.0], [1.0, 0.0] ]);

        // lifetime between 0.3-0.7 seconds
        this.setParticleLifeTime(0.5);
        this.setParticleLifeTimeRange(0.2);

        // create a new particle emitter as child, that emittes
        // the smoke particles
        // most settings are the same, i will only describe the differences
        this.smoke = new gamvas.ParticleEmitter(this.name+'_smoke', this.position.x, this.position.y);
		var smokeimg = new gamvas.Image(st.resource.getImage('media/smoke.png'));
		smokeimg.setCenter(32, 32);
        this.smoke.setImage(smokeimg);
        this.smoke.setRotationRange(2*Math.PI);
        // emit maximum of 50 (double as much as fire particles)
        this.smoke.setParticleLimit(50);
        this.smoke.setParticleRate(300);
        // particles are emitted with a speed range of 0-160 pixels per second
        this.smoke.setParticleSpeed(80);
        this.smoke.setParticleSpeedRange(80);
        this.smoke.setParticleRotationRange(2*Math.PI);
        this.smoke.setParticleRotationVelocityRange(0.5);
        // the insert ot 0.7, 0.1 gives a bit better result for smoke
        this.smoke.setAlphaTable([ [0.0, 0.0], [0.03, 0.4], [0.7, 0.1], [1.0, 0.0]]);
        // quickly scale to 100% then slowly to 300% size
        this.smoke.setScaleTable([ [0.0, 0.0], [0.1, 1.0], [1.0, 3.0] ]);

        // particle lifetime between 0.2-1.2 seconds
        this.smoke.setParticleLifeTime(0.7);
        this.smoke.setParticleLifeTimeRange(0.5);

        // slow the particle speed down over time
        this.smoke.setParticleVelocityDamping(0.4);
    },

    draw: function(t) {
        // update the smoke emitters position to our fire emitters
        this.smoke.setPosition(this.position.x, this.position.y);
        // draw smoke
        this.smoke.draw(t);
        // call super draw function (aka draw fire on top of smoke)
        this._super(t);
    },

    reset: function(kill) {
        // overwrite the emitters reset function to reset ourself ...
        this._super(kill);
        // ... and our smoke emitter
        this.smoke.reset(kill);
    }
});

