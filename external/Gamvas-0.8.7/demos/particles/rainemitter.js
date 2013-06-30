// a particle effect that emulates rain
rainEmitter = gamvas.ParticleEmitter.extend({
    // overwrite constructor
	create: function(name, x, y, img, anim) {
        // position our emitter slightly over the screen
		var dim = gamvas.getCanvasDimension();
		this._super(name, 0, -dim.h*0.5-20, img, anim);
		var st = gamvas.state.getCurrentState();

        // get our rain image and set its center to the bottom center
		var rainimg = new gamvas.Image(st.resource.getImage('media/rain.png'));
		rainimg.setCenter(1, 30);
		this.setImage(rainimg);

        // our raindrops orient themself along their path
		this.aligntoPath = true;

        // start with 100 drops per second
		this.setParticleRate(100);

        // let the particles start from a area slightly wider then the screen
        // range is always +/- from the center, so we use 0.6 time screen width
		this.setParticleStartPositionRange(new gamvas.Vector2D(dim.w*0.6, 0));

        // set the alpha of our raindrops to 0.5 over whole lifetime
		this.setAlphaTable([ [0.0, 0.5], [1.0, 0.5] ]);

        // raindrops do fall fast
		this.setParticleSpeed(dim.h*2);
		this.setParticleSpeedRange(dim.h*0.1);

        // the lifetime is something you have to match to your speed and
        // speed range by try and error, so they and up over the water
		this.setParticleLifeTime(0.45);
		this.setParticleLifeTimeRange(0.06);

        // emulate a bit of wind by turning the emitter slightly
		this.setRotation(0.15);

        // initialize the stuff we need for the splash emitters
		this.splashCounter = 0;
		this.splashImage = st.resource.getImage('media/splash.png');
		this.splashes = [];
	},

    draw: function(t) {
        // draw our spashes and delete them if finished
		var newsplashes = [];
		for (var i = 0; i < this.splashes.length; i++) {
			this.splashes[i].draw(t);
			if (this.splashes[i].lifeTime < 0.5) {
				newsplashes.push(this.splashes[i]);
            } else {
                delete this.splashes[i].draw(t);
            }
		}
		this.splashes = newsplashes;

        // call the super draing function to get the actual
        // particles drawn
        this._super(t);
    },

	onParticleEnd: function(pos, rot, scale, vel) {
        // if a particle dies, create a single particle emitter with a splash image
        var spi = new gamvas.Image(this.splashImage);
        spi.setCenter(16, 16);
        var sp = new gamvas.ParticleEmitter('splash'+this.splashCounter, pos.x, pos.y, spi);
        // only one splash
        sp.setParticleLimit(1);
        // fade in quickly to 0.2, then at a 1/10 of lifetime to 0.5
        // and the rest (9/10) slowly fade out
        sp.setAlphaTable([ [0.0, 0.0], [0.01, 0.2], [0.1, 0.5], [1.0, 0.0] ]);
        // scale quickly to 0.5 and then slow down until 1.0
        sp.setScaleTable([ [0.0, 0.2], [0.3, 0.5], [1.0, 1.0] ]);
        // stay in place
        sp.setParticleSpeed(0);
        sp.setParticleLifeTime(0.4);
        // save it for drawing
        this.splashes.push(sp);
        this.splashCounter++;
	}
});
