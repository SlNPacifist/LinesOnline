demoState = gamvas.State.extend({
    init: function() {
        this.doSearch = false;
        this.startSelected = false;
        this.endSelected = false;
        this.step = 0;
        this.start = new gamvas.Vector2D();
        this.end = new gamvas.Vector2D();

        // read the level image
        this.bg = new gamvas.Image(this.resource.getImage('bg.png'));

        // create the map
        this.map = new gamvas.AStarMap();

        // center camera on background image
        this.camera.setPosition(320, 240);

        /*
         * set nodes
         *
         * Please keep in mind, that a) this demo only uses a very
         * small net of nodes, this is to keep the source short. In
         * real live you should always try to give the algorithm a couple
         * of possible solutions for every possible target and try
         * to avoid long parts without nodes, or the result will
         * look weird.
         *
         * b) gamvas will get visual tools for editing node nets,
         * please check the homepage for updates on this topic
         */
        // create a node on its position
        var n1 = new gamvas.AStarNode(55, 104);
        // add it to the map
        this.map.add(n1);
        var n2 = new gamvas.AStarNode(172, 104);
        // do not forget to connect nodes
        n1.connect(n2);
        this.map.add(n2);
        n2 = new gamvas.AStarNode(55, 55);
        this.map.add(n2);
        n1.connect(n2);
        n2 = new gamvas.AStarNode(55, 210);
        this.map.add(n2);
        n1.connect(n2);
        n1 = new gamvas.AStarNode(250, 210);
        this.map.add(n1);
        n2.connect(n1);
        n2 = new gamvas.AStarNode(340, 210);
        this.map.add(n2);
        n2.connect(n1);
        var n3 = new gamvas.AStarNode(340, 130);
        this.map.add(n3);
        n2.connect(n3);
        n1.connect(n3);
        var n4 = new gamvas.AStarNode(250, 130);
        this.map.add(n4);
        n3.connect(n4);
        n4.connect(n1);
        n4.connect(n2);
        n3 = new gamvas.AStarNode(340, 300);
        this.map.add(n3);
        n1.connect(n3);
        n2.connect(n3);
        n4 = new gamvas.AStarNode(272, 300);
        this.map.add(n4);
        n1.connect(n4);
        n2.connect(n4);
        n3.connect(n4);
        n1 = new gamvas.AStarNode(272, 396);
        this.map.add(n1);
        n4.connect(n1);
        n2 = new gamvas.AStarNode(505, 396);
        this.map.add(n2);
        n1.connect(n2);
        n3 = new gamvas.AStarNode(272, 430);
        this.map.add(n3);
        n1.connect(n3);
        var n5 = new gamvas.AStarNode(135, 430);
        this.map.add(n5);
        n3.connect(n5);
        n1 = new gamvas.AStarNode(505, 240);
        this.map.add(n1);
        n2.connect(n1);
        n2 = new gamvas.AStarNode(505, 60);
        this.map.add(n2);
        n1.connect(n2);
        n3 = new gamvas.AStarNode(608, 240);
        this.map.add(n3);
        n1.connect(n3);
        n2 = new gamvas.AStarNode(608, 443);
        this.map.add(n2);
        n3.connect(n2);
        n1 = new gamvas.AStarNode(135, 300);
        this.map.add(n1);
        n5.connect(n1);
    },

    preDraw: function(t) {
        // draw background
        this.bg.draw(t);
    },

    draw: function(t) {
        // try to sync drawing and searching to prevent race conditions
        if (this.doSearch) {
            this.path = this.map.find(this.start.x, this.start.y, this.end.x, this.end.y);
            this.doSearch = false;
        }

        // draw all nodes
        for (var i = 0; i < this.map.nodes.length; i++) {
            this.c.fillStyle = 'rgb(200, 200, 200)';
            var n = this.map.nodes[i];
            // draw dots
            this.c.beginPath();
            this.c.arc(n.position.x, n.position.y, 7, 0, 2*Math.PI, true);
            this.c.closePath();
            this.c.fill();
            // draw connections for each node
            for (var c = 0; c < n.connected.length; c++) {
                var con = n.connected[c];
                this.c.strokeStyle = 'rgb(200, 100, 100)';
                this.c.beginPath();
                this.c.moveTo(n.position.x, n.position.y);
                this.c.lineTo(con.position.x, con.position.y);
                this.c.stroke();
            }
        }
        // draw the solution (if exists)
        this.drawPath(t);
        // draw path start (small green dot)
        if (this.startSelected) {
            if (this.path) {
                this.c.strokeStyle = 'rgb(200, 200, 0)';
                this.c.beginPath();
                this.c.moveTo(this.start.x, this.start.y);
                this.c.lineTo(this.path[0].position.x, this.path[0].position.y);
                this.c.stroke();
            }
            this.c.fillStyle = 'rgb(0, 200, 0)';
            this.c.beginPath();
            this.c.arc(this.start.x, this.start.y, 4, 0, 2*Math.PI, true);
            this.c.closePath();
            this.c.fill();
        }
        // draw path end (small red dot)
        if (this.endSelected) {
            if (this.path) {
                this.c.strokeStyle = 'rgb(200, 200, 0)';
                this.c.beginPath();
                this.c.moveTo(this.end.x, this.end.y);
                this.c.lineTo(this.path[this.path.length-1].position.x, this.path[this.path.length-1].position.y);
                this.c.stroke();
            }
            this.c.fillStyle = 'rgb(200, 50, 50)';
            this.c.beginPath();
            this.c.arc(this.end.x, this.end.y, 4, 0, 2*Math.PI, true);
            this.c.closePath();
            this.c.fill();
        }
        // draw text
        this.c.fillStyle = '#fff';
        this.c.font = 'bold 16px sans-serif';
        this.c.textAlign = 'center';
        switch (this.step) {
        case 0:
            this.c.fillText("Use mouse click to select start position", 320, 20);
            break;
        case 1:
            this.c.fillText("Select target position", 320, 20);
            break;
        default:
            break;
        }
    },

    // draw the actual solution
    drawPath: function(t) {
        // do we have a solition?
        if (this.path) {
            for (var i = 0; i < this.path.length; i++) {
                // draw each step
                this.c.fillStyle = 'rgb(200, 200, 0)';
                var n = this.path[i];
                this.c.beginPath();
                this.c.arc(n.position.x, n.position.y, 7, 0, 2*Math.PI, true);
                this.c.closePath();
                this.c.fill();
                // and put a line to the next (unless on the last one)
                if (i < this.path.length-1) {
                    var next = this.path[i+1];
                    this.c.strokeStyle = 'rgb(200, 200, 0)';
                    this.c.lineWidth = 4;
                    this.c.beginPath();
                    this.c.moveTo(n.position.x, n.position.y);
                    this.c.lineTo(next.position.x, next.position.y);
                    this.c.stroke();
                }
            }
        }
    },

    onMouseDown: function(button, x, y) {
        if (button == gamvas.mouse.LEFT) {
            switch (this.step) {
            case 1:
                // on second mouseclick, save end position and recalculate (in draw())
                this.end.x = x;
                this.end.y = y;
                this.step = 0;
                this.doSearch = true;
                this.endSelected = true;
                break;
            case 0:
                // on first mouseclick, remove solution and save mouse pos
                delete this.path;
                this.start.x = x;
                this.start.y = y;
                this.step++;
                this.startSelected = true;
                break;
            default:
                break;
            }
        }
    }
});

gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new demoState('demo'));
    gamvas.start('gameCanvas');
});
