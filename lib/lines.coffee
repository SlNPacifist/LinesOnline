GRID_SIZE = 50
BALL_SIZE = 48
BALL_ANIMATION_FRAME_COUNT = 8
BALL_ANIMATION_FPS = 10
COL_COUNT = 9
LINE_COUNT = 9

BALL_COLORS = ['blue', 'brown', 'pink', 'red', 'teal', 'yellow']

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
        @addState(new UsualBallState('usual'), true)

class BallGrid
    # List of possible directions to check lines from newly appeared ball
    # list of [dx, dy]
    LINE_DIRECTIONS: [[-1, 0], [-1, -1], [0, -1], [1, -1]]
    # Minimum number of successive balls in a line that are removed from field
    MIN_LINE_LENGTH: 5

    constructor: (@width, @height, @parent) ->
        @container = []
        for i in [0...@width]
            @container.push([])

    add: (x, y, ball) ->
        @container[x][y] = ball
        @checkLinesRemovalInPosition(x, y)

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
        # Check lines for all possible directions
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
        @removeLine(line...) for line in linesToRemove

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


GameState = gamvas.State.extend
    init: ->
        @gridPosClicks = []
        @grid = new BallGrid(COL_COUNT, LINE_COUNT, @)
        @addRandomBalls(5)
        @camera.setPosition(GRID_SIZE * COL_COUNT / 2, GRID_SIZE * LINE_COUNT / 2)

    addRandomBalls: (num) ->
        @addRandomBall() for i in [1..num]

    addRandomBall: ->
        freePositions = @grid.getFreePositions()
        posIndex = Math.floor(Math.random() * freePositions.length)
        [x, y] = freePositions[posIndex]
        colorIndex = Math.floor(Math.random() * BALL_COLORS.length)
        color = BALL_COLORS[colorIndex]
        @addBall(x, y, color)

    addBall: (x, y, color) ->
        [screenX, screenY] = @getScreenPos(x, y)
        ball = new Ball(false, screenX, screenY, color)
        @addActor(ball)
        @grid.add(x, y, ball)

    draw: ->
        for pos in @gridPosClicks
            [x, y] = pos
            if ball = @grid.get(x, y)
                @setActiveBall(ball)
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
        @grid.remove(oldX, oldY)
        [screenX, screenY] = @getScreenPos(x, y)
        ball.setPosition(screenX, screenY)
        @grid.add(x, y, ball)

    getGridPos: (x, y) ->
        x = Math.floor(x / GRID_SIZE)
        y = Math.floor(y / GRID_SIZE)
        return [x, y] if 0 <= x < COL_COUNT and 0 <= y < LINE_COUNT
        return null

    getScreenPos: (x, y) ->
        [x * GRID_SIZE, y * GRID_SIZE]

    removeBall: (x, y) ->
        return if not ball = @grid.get(x, y)
        @removeActor(ball)
        @grid.remove(x, y)

    onMouseDown: (b, x, y) ->
        return if b isnt gamvas.mouse.LEFT
        worldCoord = this.camera.toWorld(x, y)
        gridPos = @getGridPos(worldCoord.x, worldCoord.y)
        return if not gridPos
        @gridPosClicks.push(gridPos)


gamvas.event.addOnLoad ->
    gamvas.state.addState(new GameState('game'))
    gamvas.start('lines-canvas', false)
