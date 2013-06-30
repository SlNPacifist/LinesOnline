GRID_SIZE = 26
COL_COUNT = 9
LINE_COUNT = 9

Ball = gamvas.Actor.extend
    create: (name, x, y) ->
        @_super(name, x, y)
        curState = gamvas.state.getCurrentState()
        @setFile(curState.resource.getImage('ball.png'))

GameState = gamvas.State.extend
    init: ->
        for i in [0...COL_COUNT]
            for j in [0...LINE_COUNT]
                @addBall(i, j)
        @camera.setPosition(GRID_SIZE * COL_COUNT / 2, GRID_SIZE * LINE_COUNT / 2)

    addBall: (x, y) ->
        x *= GRID_SIZE
        y *= GRID_SIZE
        @addActor(new Ball(false, x, y))

    draw: ->

gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
