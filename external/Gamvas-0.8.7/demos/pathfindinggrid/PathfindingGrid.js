demoState = gamvas.State.extend({
    init: function() {
        this.allowDiagonal = false;
        this.currentResult = [];
        this.startY = 0;
        this.endY = 0;
        this.forceReset = false;

        this.camera.setPosition(220, 220);
        this.resetField();
    },

    resetField: function() {
        // create our pathfinding map

        // two strategies are possible:

        // this strategy takes height differences into account
        // this.field = new gamvas.AStarGrid(20, 20, this.allowDiagonal, false, gamvas.AStar.STRATEGY_AVOID_STEPS);

        // this strategy ignores height differences, just counts walkable/non-walkable
        this.field = new gamvas.AStarGrid(20, 20, this.allowDiagonal, false, gamvas.AStar.STRATEGY_IGNORE_STEPS);

        /* initialize it with random values (-1 to 5).
         *
         * Positive values are the 'cost' of walk, so
         * 0 means perfect road, values higher then 0
         * mean kind of offroad, or up hill.
         *
         * Negative values mean: not walkable.
         */
        for (var y = 0; y < 20; y++) {
            for (var x = 0; x < 20; x++) {
                var v = parseInt(Math.random()*6, 10)-1;
                /* if (v > 0) {
                    v = 5;
		} */
                this.field.setValue(x, y, v);
            }
        }

        var endless = 0;
        do {
            this.startY = parseInt(Math.random()*19, 10);
            this.endY = parseInt(Math.random()*19, 10);
            endless++;
            if (endless > 100) {
                this.resetField();
            }
        } while ( (this.field.getValue(0, this.startY) < 0) || (this.field.getValue(19, this.endY) < 0) );

        this.currentResult = this.field.find(0, this.startY, 19, this.endY);
    },

    draw: function(t) {
        // check if user requested redraw
        if (this.forceReset) {
            this.forceReset = false;
            this.resetField();
        }

        // draw field
        for (var y = 0; y < 20; y++) {
            for (var x = 0; x < 20; x++) {
                var v = this.field.getValue(x, y);
                if (v < 0) {
                    // black square for non walkable
                    this.c.fillStyle = 'rgb(0,0,0)';
                } else {
                    // green shade for walkable, depending on their value
                    var r = 38+v*15;
                    var g = 119+v*25;
                    var b = 50+v*15;
                    this.c.fillStyle = 'rgb('+r+','+g+','+b+')';
                }
                this.c.fillRect (x*22,y*22,20,20);
            }
        }

        // draw path
        this.c.fillStyle = 'rgb(255,255,0)';
        for (var i = 0; i < this.currentResult.length; i++) {
            var n = this.currentResult[i];
            this.c.fillRect(n.position.x*22+5,n.position.y*22+5,10,10);
        }

        // draw start
        this.c.fillStyle = 'rgb(0,255,255)';
        this.c.fillRect(5,this.startY*22+5,10,10);

        // draw end
        this.c.fillStyle = 'rgb(255,0,0)';
        this.c.fillRect(19*22+5,this.endY*22+5,10,10);

        // print message if no solution available
        if (this.currentResult.length < 1) {
            this.c.fillStyle = 'rgb(60,60,60)';
            this.c.fillRect(220-100,220-25,200,40);
            this.c.fillStyle = 'rgb(255,255,255)';
            this.c.font = 'bold 20px sans-serif';
            this.c.textAlign = 'center';
            this.c.fillText("There is no way!", 220, 220);
        }
    }
});

gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new demoState('demo'));
    gamvas.start('demo');
});
