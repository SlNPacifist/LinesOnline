function drawNextEffect(ctx) {
    var dim = gamvas.getCanvasDimension();
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText("Space for next effect", dim.w-5, dim.h-10);
    ctx.restore();
}
