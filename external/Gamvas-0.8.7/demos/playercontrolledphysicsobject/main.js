// playerState extends gamvas.ActorState and is the players (blue ball) brain
playerState = gamvas.ActorState.extend({
	create: function(name) {
        this._super(name);

        this.moveSpeed = 20;
    },

    update: function(t) {
        var xSpeed = 0;
        var ySpeed = 0;

        if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            xSpeed = -this.moveSpeed*t;
        }
        if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            xSpeed = this.moveSpeed*t;
        }
        if (gamvas.key.isPressed(gamvas.key.UP)) {
            ySpeed = -this.moveSpeed*t;
        }
        if (gamvas.key.isPressed(gamvas.key.DOWN)) {
            ySpeed = this.moveSpeed*t;
        }

        if ( (xSpeed !== 0) || (ySpeed !== 0) ) {
            // move our player into the direction determined by cursor keys
            this.actor.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(xSpeed*t, ySpeed*t), this.actor.body.GetPosition());
        }
    }
});

// the keyboard controlled ball (blue)
player = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);

            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('player.png'));
            this.restitution = 0.4;
            this.friction = 0.8;
            this.bodyCircle(this.position.x, this.position.y, 16);

            // make player slow down quite signifficant, once no cursor keys are pressed
            // actually this works as counter force to the ApplyImpulse in the playerState
            // the higher the damping, the higher the force has to be to push against the damping
            this.setLinearDamping(2);

            // prevent player from rotating
            this.setFixedRotation(true);

            // insert brain, aka add and set playerState
            this.addState(new playerState('brain'));
            this.setState('brain');
        }
});

// the 'brain' of the mouse controlled KINEMATIC body
mouseState = gamvas.ActorState.extend({
	onMouseMove: function(x, y, ev) {
        // set position according to mouse position
        var st = gamvas.state.getCurrentState();
        // use mouseposition in world coordinates, instead of screen coordinates
        var worldMouse = st.camera.toWorld(x, y);
        this.actor.setPosition(worldMouse.x, worldMouse.y);
    }
});

// the mouse controlled ball (violet)
mouse = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);

            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('mouse.png'));
            this.restitution = 0.4;
            // gamvas.physics.KINEMATIC describes objects, that are not
            // under physics control, but are part of the physics world
            // so objects will collide with KINEMATIC objects
            //
            // other then STATIC objects, you may move KINEMATIC objects
            this.bodyCircle(this.position.x, this.position.y, 16, gamvas.physics.KINEMATIC);

            // mouse can move fast, so lets ensure that collisions are detected
            // even when user moves mouse at a speed where it would jump over
            // barriers
            this.setBullet(true);

            // insert brain, aka add and set playerState
            this.addState(new mouseState('brain'));
            this.setState('brain');

            // make our actor receive mouse and keyboard events
            st.registerInputEvents(this);
        }
});

// yellow balls to kick around, no player controll, 100% physics engine
circleActor = gamvas.Actor.extend({
        create: function(name, x, y) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            this.setFile(st.resource.getImage('circle.png'));
            this.restitution = 0.8;
            this.density = 0.7;
            this.bodyCircle(this.position.x, this.position.y, 16);

            // slow down the rolling ball
            this.setLinearDamping(1);

            // yellow balls also are allowed to rotate, so
            // slow the rotation down or they will rotate forever
            this.setAngularDamping(1);
        }
});

// walls on the side
wallActor = gamvas.Actor.extend({
        create: function(name, x, y, w, h) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            // check if we are a horizontal box or a vertical
            if (w>h) {
                this.setFile(st.resource.getImage('horizontal.png'));
            } else {
                this.setFile(st.resource.getImage('vertical.png'));
            }
            // create a static (non moving) rectangle
            this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
        }
});

mainState = gamvas.State.extend({
    init: function() {
        // set how many pixels are considered 1m, this is a very
        // important setting on how realistic the sim looks
        // try to orient it on your objects and how long they
        // would be in real life
        gamvas.physics.pixelsPerMeter = 128;

        // reset our physics world to have no gravity, as we
        // have a to down perspective, also do not sleep objects
        // that are not involved in physics calculation
        gamvas.physics.resetWorld(0, 0, false);

        this.grass1 = new gamvas.Image(this.resource.getImage('grass.png', 0, 0, 16, 16));

        // create the balls
        this.addActor(new player('player', 5, 5));
        this.addActor(new mouse('mouse', -100, -100));
        this.addActor(new circleActor('circle1', 50, 50));
        this.addActor(new circleActor('circle2', -150, 200));

        // create the walls
        this.addActor(new wallActor('ground', 0, 230, 640, 20));
        this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
        this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
        this.addActor(new wallActor('top', 0, -230, 640, 20));
    },

    // Overwrite the states clear screen function as we do not need the screen cleared
    // we draw a tile field anyway
    clearScreen: function() {
        if (!this.resource.done()) {
            return;
        }

        for (var y = 0; y < this.dimension.h; y+=32) {
            for (var x = 0; x < this.dimension.w; x+=32) {
                this.grass1.setPosition(x, y);
                this.grass1.draw();
            }
        }
    }
});

// prevent the browser from scrolling on keyboard input
gamvas.config.preventKeyEvents = true;

// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new mainState('mainState'));
    gamvas.start('gameCanvas', true);
});
