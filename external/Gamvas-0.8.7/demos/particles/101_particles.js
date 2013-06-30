// prevent the browser from scrolling on keyboard input
gamvas.config.preventKeyEvents = true;

// add our states and start
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new rainState('rain'));
    gamvas.state.addState(new smokeState('smoke'));
    gamvas.state.addState(new explosionState('explosion'));
    gamvas.start('gameCanvas');
    // provide fullscreen switch if browser is capable of fullscreen
    if (gamvas.hasFullScreen()) {
        var fs = document.getElementById('fullscreen');
        fs.innerHTML = '<a href="javascript:void(0);" onclick="gamvas.setFullScreen(true);">Go FullScreen</a>';
    }
});
