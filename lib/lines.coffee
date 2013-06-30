GRID_SIZE = 26
COL_COUNT = 9
LINE_COUNT = 9

ActiveBallState = gamvas.ActorState.extend
    enter: ->
        @actor.setFile(gamvas.state.getCurrentState().resource.getImage('active_ball.png'))

UsualBallState = gamvas.ActorState.extend
    enter: ->
        @actor.setFile(gamvas.state.getCurrentState().resource.getImage('ball.png'))

Ball = gamvas.Actor.extend
    create: (name, x, y) ->
        @_super(name, x, y)
        @addState(new ActiveBallState('active'))
        @addState(new UsualBallState('usual'), true)

GameState = gamvas.State.extend
    init: ->
        @gridPosClicks = []
        @grid = {}
        for i in [0...COL_COUNT]
            for j in [0...LINE_COUNT]
                @addBall(i, j)
        @camera.setPosition(GRID_SIZE * COL_COUNT / 2, GRID_SIZE * LINE_COUNT / 2)

    addBall: (x, y) ->
        ball = new Ball(false, x * GRID_SIZE, y * GRID_SIZE)
        @addActor(ball)
        @grid["#{x}_#{y}"] = ball

    draw: ->
        for pos in @gridPosClicks
            [x, y] = pos
            @setActiveBall(@getBallByGridPos(x, y))
        @gridPosClicks = []

    getBallByGridPos: (x, y) ->
        @grid["#{x}_#{y}"]

    setActiveBall: (ball) ->
        @activeBall?.setState('usual')
        @activeBall = ball
        ball.setState('active')

    getGridPos: (x, y) ->
        x = Math.floor(x / GRID_SIZE)
        y = Math.floor(y / GRID_SIZE)
        return [x, y] if 0 <= x < COL_COUNT and 0 <= y < LINE_COUNT
        return null

    onMouseDown: (b, x, y) ->
        return if b isnt gamvas.mouse.LEFT
        worldCoord = this.camera.toWorld(x, y)
        gridPos = @getGridPos(worldCoord.x, worldCoord.y)
        return if not gridPos
        @gridPosClicks.push(gridPos)


gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
