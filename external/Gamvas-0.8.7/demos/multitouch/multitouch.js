// IMPORTANT:
//
// To prevent zooming on android devices, you have to set the correct
// viewport meta in your html file head section. Somthing like this:
//
// <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
touchState = gamvas.State.extend({
    init: function() {
        // lets create a array to hold our touch images
        this.touches = [];
        // save if we should draw the touches`
        this.touchActive = [];
        // load our touch images for up to 10 touches
        // note: iphone/ipad support 11 simultaneous touches, don't even think about it
        // we'll stay with 10 fingers
        for (var i = 0; i < 10; i++) {
            var img = new gamvas.Image(this.resource.getImage('example.png'), 0, 0, 320, 320);
            img.setClipRect(i*64, i*64, 64, 64);
            img.setCenter(i*64+32, i*64+32);
            img.setScale(1.5);
            this.touches[i] = img;
            this.touchActive[i] = false;
        }
    },

    onTouchDown: function(id, x, y) {
        // x/y are in screenspace, get the world position from it
        var world = this.camera.toWorld(x, y);
        // set image position
        this.touches[id].position.x = world.x;
        this.touches[id].position.y = world.y;
        // draw starting touches
        this.touchActive[id] = true;
    },

    onTouchUp: function(id, x, y) {
        // do not draw ended touches
        this.touchActive[id] = false;
    },

    onTouchMove: function(id, x, y) {
        // x/y are in screenspace, get the world position from it
        var world = this.camera.toWorld(x, y);
        // update image position
        this.touches[id].position.x = world.x;
        this.touches[id].position.y = world.y;
    },

    draw: function(t) {
        for (var i = 0; i < 10; i++) {
            // draw active touches
            if (this.touchActive[i]) {
                this.touches[i].draw(t);
            }
        }
    }
});

gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new touchState('touchdemo'));
    gamvas.start('gameCanvas');
});
