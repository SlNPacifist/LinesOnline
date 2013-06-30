setDiagonal = function() {
    var cs = gamvas.state.getCurrentState();
    var cb = document.getElementById('allowDiagonal');
    if (cb) {
        cs.allowDiagonal = cb.checked;
    }
};

redraw = function() {
    var cs = gamvas.state.getCurrentState();
    cs.forceReset = true;
};
