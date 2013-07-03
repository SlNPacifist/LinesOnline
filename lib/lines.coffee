CELL_SIZE = 52
BALL_SIZE = 48
BALL_ANIMATION_FRAME_COUNT = 8
BALL_ANIMATION_FPS = 10
COL_COUNT = 9
LINE_COUNT = 9
BALL_COUNT_AT_START = 5
BALL_COUNT_PER_MOVE = 3
PREPARED_BALL_SCALE_FACTOR = 0.5

BALL_COLORS = ['blue', 'green', 'pink', 'red', 'teal', 'yellow']

PreparedBallState = gamvas.ActorState.extend
    enter: ->
        @actor.setAnimation('usual')
        @actor.setScale(PREPARED_BALL_SCALE_FACTOR)

    leave: ->
        console.log("Leaving prepared ball state")
        @actor.setScale(1)

ActiveBallState = gamvas.ActorState.extend
    enter: ->
        @actor.setAnimation('active')

UsualBallState = gamvas.ActorState.extend
    enter: ->
        @actor.setAnimation('usual')

Ball = gamvas.Actor.extend
    create: (name, x, y, @color) ->
        @_super(name, x, y)
        imageName = @color + '.png'
        resource = gamvas.state.getCurrentState().resource
        @addAnimation(new gamvas.Animation('active', resource.getImage(imageName), BALL_SIZE, BALL_SIZE, BALL_ANIMATION_FRAME_COUNT, BALL_ANIMATION_FPS))
        @addAnimation(new gamvas.Animation('usual', resource.getImage(imageName), BALL_SIZE, BALL_SIZE, 1))
        @addState(new ActiveBallState('active'))
        @addState(new PreparedBallState('prepared'))
        @addState(new UsualBallState('usual'), true)

Cell = gamvas.Actor.extend
    create: (name, x, y) ->
        @_super(name, x, y)
        @setFile(gamvas.state.getCurrentState().resource.getImage('cell.png'))

class BallGrid
    # List of possible directions to check lines from newly appeared ball
    # list of [dx, dy]
    LINE_DIRECTIONS: [[-1, 0], [-1, -1], [0, -1], [1, -1]]
    # Minimum number of successive balls in a line that are removed from field
    MIN_LINE_LENGTH: 5
    # List of possible cells that can be reached from current
    REACHABLE_CELLS: [[-1, 0], [0, -1], [1, 0], [0, 1]]

    constructor: (@width, @height, @parent) ->
        @container = @getGrid(@width)
        @initCells()

    initCells: ->
        @cells = @getGrid(@width)
        for i in [0...@width]
            for j in [0...@height]
                [x, y] = @parent.getCellScreenPos(i, j)
                cell = new Cell(false, x, y)
                @cells[i][j] = cell
                @parent.addActor(cell)

    getGrid: (width) ->
        res = []
        res.push([]) for i in [0...width]
        return res

    add: (x, y, ball) ->
        ###
        Adds ball to a grid and check lines removal
        Returns true if any line was removed
        ###
        @container[x][y] = ball
        return @checkLinesRemovalInPosition(x, y)

    remove: (x, y) ->
        @container[x][y] = null

    get: (x, y) -> @container[x][y]

    getFreePositions: ->
        res = []
        for i in [0...@width]
            for j in [0...@height] when not @container[i][j]
                res.push([i, j])
        return res

    checkLinesRemovalInPosition: (x, y) ->
        ###
        Checks lines for all possible directions
        Returns true if any line was removed
        ###
        color = @container[x][y].color
        linesToRemove = []
        for [dx, dy] in @LINE_DIRECTIONS
            dirCount = @getMaxBallCount(x, y, dx, dy, color)
            oppositeDirCount = @getMaxBallCount(x, y, -dx, -dy, color)
            totalCount = dirCount + oppositeDirCount + 1
            continue if totalCount < @MIN_LINE_LENGTH
            # mark line for removal
            # do not remove it now, because it could fail further checks
            startX = x + dx * dirCount
            startY = y + dy * dirCount
            linesToRemove.push([startX, startY, -dx, -dy, totalCount])
        return false if not linesToRemove.length
        @removeLine(line...) for line in linesToRemove
        return true

    getMaxBallCount: (x, y, dx, dy, neededColor) ->
        # Counts number of successive balls in a line starting from x, y in a direction dx, dy
        # Does not count ball at x, y
        res = 0
        x += dx
        y += dy
        while 0 <= x < @width and 0 <= y < @height and (ball = @container[x][y]) and (ball.color is neededColor)
            res++
            x += dx
            y += dy
        return res

    removeLine: (startX, startY, dx, dy, count) ->
        for i in [1..count]
            if curX? then curX += dx
            else curX = startX
            if curY? then curY += dy
            else curY = startY
            @parent.removeBall(curX, curY)

    getReachGrid: (x, y) ->
        # Returns grid that contains number of needed steps to reach each cell
        res = @getGrid(@width)
        res[x][y] = 0
        cellQueue = [[x, y]]
        while cellQueue.length
            [x, y] = cellQueue.shift()
            nextStepCount = res[x][y] + 1
            for [dx, dy] in @REACHABLE_CELLS
                newX = x + dx
                newY = y + dy
                continue if not (0 <= newX < @width) or not (0 <= newY < @height)
                continue if res[newX][newY] isnt undefined
                continue if @container[newX][newY]
                res[newX][newY] = nextStepCount
                cellQueue.push([newX, newY])
        return res

    canReach: (startX, startY, endX, endY) ->
        grid = @getReachGrid(startX, startY)
        return grid[endX][endY]?

extractRandom = (array) ->
    # extracts random element from array, deletes it in array and returns it
    index = Math.floor(Math.random() * array.length)
    res = array[index]
    array[index..index] = []
    return res

GameState = gamvas.State.extend
    init: ->
        @gridPosClicks = []
        @preparedBalls = []
        @grid = new BallGrid(COL_COUNT, LINE_COUNT, @)
        @addBallsToGrid(@createRandomBalls(BALL_COUNT_AT_START))
        @prepareBallsToAdd()
        @camera.setPosition(CELL_SIZE * COL_COUNT / 2, CELL_SIZE * LINE_COUNT / 2)

    createRandomBalls: (num) ->
        res = []
        freePositions = @grid.getFreePositions()
        for i in [1..num]
            [x, y] = extractRandom(freePositions)
            colorIndex = Math.floor(Math.random() * BALL_COLORS.length)
            color = BALL_COLORS[colorIndex]
            res.push(@createBall(x, y, color))
        return res

    createBall: (x, y, color) ->
        [screenX, screenY] = @getBallScreenPos(x, y)
        return new Ball(false, screenX, screenY, color)

    addBallsToGrid: (balls) ->
        @addBallToGrid(ball) for ball in balls

    addBallToGrid: (ball) ->
        @addActor(ball)
        [x, y] = @getGridPos(ball.position.x, ball.position.y)
        @grid.add(x, y, ball)

    prepareBallsToAdd: ->
        newBalls = @createRandomBalls(BALL_COUNT_PER_MOVE)
        for ball in newBalls
            ball.setState('prepared')
            @addActor(ball)
            @preparedBalls.push(ball)

    removeBall: (x, y) ->
        return if not ball = @grid.get(x, y)
        @removeActor(ball)
        @grid.remove(x, y)

    draw: ->
        for pos in @gridPosClicks
            [x, y] = pos
            if ball = @grid.get(x, y)
                @setActiveBall(ball)
            else if @activeBall
                [activeX, activeY] = @getGridPos(@activeBall.position.x, @activeBall.position.y)
                continue if not @grid.canReach(activeX, activeY, x, y)
                lineRemoved = @setBallPos(@activeBall, x, y)
                @setActiveBall(null)
                continue if lineRemoved
                @addPreparedBalls()
                @prepareBallsToAdd()
        @gridPosClicks = []

    replaceBalls: (ballsToReplace, fixedBalls) ->
        freePositions = @grid.getFreePositions()
        for ball in fixedBalls
            # Removed fixed ball's position from list of possible positions
            [x, y] = @getGridPos(ball.position.x, ball.position.y)
            for [curX, curY], index in freePositions when curX is x and curY is y
                break
            freePositions[index..index] = []
        for ball in ballsToReplace
            # Find new place for ball
            [x, y] = extractRandom(freePositions)
            [screenX, screenY] = @getBallScreenPos(x, y)
            ball.setPosition(screenX, screenY)

    addPreparedBalls: ->
        ballsToReplace = []
        fixedBalls = []
        for ball in @preparedBalls
            ball.setState('usual')
            [x, y] = @getGridPos(ball.position.x, ball.position.y)
            if @grid.get(x, y)
                ballsToReplace.push(ball)
            else
                fixedBalls.push(ball)
        @replaceBalls(ballsToReplace, fixedBalls) if ballsToReplace
        @addBallsToGrid(@preparedBalls)
        @preparedBalls = []

    setActiveBall: (ball) ->
        @activeBall?.setState('usual')
        @activeBall = ball
        ball?.setState('active')

    setBallPos: (ball, x, y) ->
        ###
        Sets ball position
        Returns true if any line was removed due to this action
        ###
        [oldX, oldY] = @getGridPos(ball.position.x, ball.position.y)
        @grid.remove(oldX, oldY)
        [screenX, screenY] = @getBallScreenPos(x, y)
        ball.setPosition(screenX, screenY)
        return @grid.add(x, y, ball)

    getGridPos: (x, y) ->
        x = Math.floor(x / CELL_SIZE)
        y = Math.floor(y / CELL_SIZE)
        return [x, y] if 0 <= x < COL_COUNT and 0 <= y < LINE_COUNT
        return null

    getCellScreenPos: (x, y) ->
        [x * CELL_SIZE, y * CELL_SIZE]

    getBallScreenPos: (x, y) ->
        [resX, resY] = @getCellScreenPos(x, y)
        offset = (CELL_SIZE - BALL_SIZE) / 2
        return [resX + offset, resY + offset]

    onMouseDown: (b, x, y) ->
        return if b isnt gamvas.mouse.LEFT
        worldCoord = this.camera.toWorld(x, y)
        gridPos = @getGridPos(worldCoord.x, worldCoord.y)
        return if not gridPos
        @gridPosClicks.push(gridPos)


gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
