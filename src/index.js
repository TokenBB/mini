var choo = require('choo')
var devtools = require('choo-devtools')

var app = choo()

app.use(devtools())
app.use(require('./store'))

app.route('/', require('./layout')(require('./views/topics.view')))
app.route('/topics/:topicId', require('./layout')(require('./views/topic.view')))
app.route('/new', require('./layout')(require('./views/new-topic.view')))

app.mount('body')
