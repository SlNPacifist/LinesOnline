GRID_SIZE = 26
COL_COUNT = 9
LINE_COUNT = 9
# List of possible directions to check lines from newly appeared ball
# list of [dx, dy]
LINE_DIRECTIONS = [[-1, 0], [-1, -1], [0, -1], [1, -1]]
# Minimum number of successive balls in a line that are removed from field
MIN_LINE_LENGTH = 5

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
        @checkLinesRemovalInPosition(x, y)

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
        @checkLinesRemovalInPosition(x, y)

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

    checkLinesRemovalInPosition: (x, y) ->
        # Check lines for all possible directions
        linesToRemove = []
        for [dx, dy] in LINE_DIRECTIONS
            dirCount = @getMaxBallCount(x, y, dx, dy)
            oppositeDirCount = @getMaxBallCount(x, y, -dx, -dy)
            continue if dirCount + oppositeDirCount + 1 < MIN_LINE_LENGTH
            # mark line for removal
            # do not remove it now, because it could fail successive checks
            startX = x + dx * dirCount
            startY = y + dy * dirCount
            endX = x - dx * oppositeDirCount
            endY = y - dy * oppositeDirCount
            linesToRemove.push([startX, startY, endX, endY])
        @removeLine(line...) for line in linesToRemove

    getDirection: (start, end) ->
        return 0 if start is end
        return 1 if end > start
        return -1 if end < start

    removeLine: (startX, startY, endX, endY) ->
        dx = @getDirection(startX, endX)
        dy = @getDirection(startY, endY)
        curX = startX
        curY = startY
        @removeBall(curX, curY)
        while (curX isnt endX) or (curY isnt endY)
            curX += dx
            curY += dy
            @removeBall(curX, curY)

    removeBall: (x, y) ->
        return if not @grid[x][y]
        @removeActor(@grid[x][y])
        @grid[x][y] = null

    getMaxBallCount: (x, y, dx, dy) ->
        # Counts number of successive balls in a line starting from x, y in a direction dx, dy
        # Does not count ball at x, y
        res = 0
        x += dx
        y += dy
        while 0 <= x < COL_COUNT and 0 <= y < LINE_COUNT and @grid[x][y]
            res++
            x += dx
            y += dy
        return res

    onMouseDown: (b, x, y) ->
        return if b isnt gamvas.mouse.LEFT
        worldCoord = this.camera.toWorld(x, y)
        gridPos = @getGridPos(worldCoord.x, worldCoord.y)
        return if not gridPos
        @gridPosClicks.push(gridPos)


gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
