require('dotenv').config()

var budo = require('budo')

budo('src/index.js:bundle.js', {
  live: true,
  dir: 'public',
  pushstate: true,
  browserify: {
    transform: [
      'sheetify',
      [ 'loose-envify', process.env ]
    ]
  }
}).on('connect', e => {
  console.log('listening on', e.port)
})
