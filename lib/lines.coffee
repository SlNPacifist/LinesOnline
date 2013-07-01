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
        @grid = []
        for i in [0...COL_COUNT]
            @grid.push([])
        @addRandomBalls(5)
        @camera.setPosition(GRID_SIZE * COL_COUNT / 2, GRID_SIZE * LINE_COUNT / 2)

    addRandomBalls: (num) ->
        @addRandomBall() for i in [1..num]

    addRandomBall: ->
        freePositions = @getFreeGridPositions()
        posIndex = Math.floor(Math.random() * freePositions.length)
        [x, y] = freePositions[posIndex]
        @addBall(x, y)

    addBall: (x, y) ->
        [screenX, screenY] = @getScreenPos(x, y)
        ball = new Ball(false, screenX, screenY)
        @addActor(ball)
        @grid[x][y] = ball

    draw: ->
        for pos in @gridPosClicks
            [x, y] = pos
            if @grid[x][y]
                @setActiveBall(@grid[x][y])
            else if @activeBall
                @setBallPos(@activeBall, x, y)
                @setActiveBall(null)
                @addRandomBalls(3)
        @gridPosClicks = []

    setActiveBall: (ball) ->
        @activeBall?.setState('usual')
        @activeBall = ball
        ball?.setState('active')

    setBallPos: (ball, x, y) ->
        [oldX, oldY] = @getGridPos(ball.position.x, ball.position.y)
        @grid[oldX][oldY] = null
        [screenX, screenY] = @getScreenPos(x, y)
        ball.setPosition(screenX, screenY)
        @grid[x][y] = ball

    getFreeGridPositions: ->
        res = []
        for i in [0...COL_COUNT]
            for j in [0...LINE_COUNT] when not @grid[i][j]
                res.push([i, j])
        return res

    getGridPos: (x, y) ->
        x = Math.floor(x / GRID_SIZE)
        y = Math.floor(y / GRID_SIZE)
        return [x, y] if 0 <= x < COL_COUNT and 0 <= y < LINE_COUNT
        return null

    getScreenPos: (x, y) ->
        [x * GRID_SIZE, y * GRID_SIZE]

    onMouseDown: (b, x, y) ->
        return if b isnt gamvas.mouse.LEFT
        worldCoord = this.camera.toWorld(x, y)
        gridPos = @getGridPos(worldCoord.x, worldCoord.y)
        return if not gridPos
        @gridPosClicks.push(gridPos)


gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
