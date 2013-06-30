express = require('express')
app = express()
app.use(express.static('static', {maxAge: 86400000}))
app.listen(3000)