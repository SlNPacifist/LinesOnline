express = require('express')
app = express()
console.log("Adding static listener to", __dirname + '/static')
app.use(express.static('static'))
app.listen(3000)