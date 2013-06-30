GRID_SIZE = 25
COL_COUNT = 9
LINE_COUNT = 9

Ball = gamvas.Actor.extend
    create: (name, x, y) ->
        @_super(name, x, y)
        curState = gamvas.state.getCurrentState()
        @setFile(curState.getImage('ball.png'))

GameState = gamvas.State.extend
    init: ->
        @addBalls(5)

    addBall: () ->
        x = Math.floor(Math.random() * COL_COUNT)
        y = Math.floor(Math.random() * LINE_COUNT)
        @addActor(new Ball(false, x * GRID_SIZE, y * GRID_SIZE))

    draw: ->

#gamvas.config.preventKeyEvents = true
gamvas.event.addOnload ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
