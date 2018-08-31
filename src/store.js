const KEYS = {
  ACCESS_TOKEN: process.env.APP_ACCOUNT + ':access-token',
  USERNAME: process.env.APP_ACCOUNT + ':username'
}

var steem = require('@steemit/steem-js')
var sc2 = require('sc2-sdk')
var request = require('request')
var series = require('run-series')

var storage = window.sessionStorage
var connect = createConnectAPI()

steem.api.setOptions({ url: 'wss://' + process.env.STEEMD_URL })
steem.config.set('address_prefix', process.env.ADDRESS_PREFIX)
steem.config.set('chain_id', process.env.CHAIN_ID)

module.exports = store

function store (state, emitter, app) {
  state.app = {
    categories: [{ name: 'All Categories' }, { name: 'Bacon' }],
    tabs: [{ name: 'Latest' }, { name: 'Top' }],
    loginURL: connect.getLoginURL()
  }

  state.topics = {
    loading: true,
    posting: false,
    list: [],
    filters: {
      category: null
    }
  }

  resetAuthState()

  emitter.on('DOMContentLoaded', () => {
    emitter.on('create-topic', createTopic)
    emitter.on('logout', logout)

    onInit()
  })

  function onInit () {
    if (state.query.access_token) storeSession()

    loadTopics()
    loadSession()

    emitter.emit('render')
  }

  async function createTopic (form) {
    state.topics.posting = true
    emitter.emit('render')

    var author = state.auth.username
    var title = form.title.value
    var slug = slugFrom(title)
    var id = `${author}_${slug}`
    var content = form.content.value
    var category = form.category.value

    series([
      done => draft(author, category, title, content, done),
      done => broadcast(author, category, title, content, done),
      done => publish(id, done)
    ], onDone)

    function onDone (err) {
      if (err) return handleErrors(err)

      state.topics.posting = false

      emitter.emit(state.events.PUSHSTATE, `/topics/${id}`)
    }

    function handleErrors (err) {
      console.error(err)
      state.topics.posting = false
      emitter.emit('render')
    }
  }

  function logout () {
    clearSession()
    resetAuthState()
  }

  function resetAuthState () {
    state.auth = {
      accessToken: null,
      username: ''
    }

    emitter.emit('render')
  }

  function loadTopics () {
    var opts = {
      method: 'GET',
      url: process.env.API_URL + '/topics',
      json: true
    }

    request(opts, (err, res) => {
      if (err) return console.error(err)

      state.topics.list = res.body.filter(topic => topic.status === 'publish')
      state.topics.loading = false

      emitter.emit('render')
    })
  }

  function storeSession () {
    storage.setItem(KEYS.ACCESS_TOKEN, state.query.access_token)
    storage.setItem(KEYS.USERNAME, state.query.username)

    emitter.emit(state.events.REPLACESTATE, '/')
  }

  function loadSession () {
    var accessToken = storage.getItem(KEYS.ACCESS_TOKEN)
    var username = storage.getItem(KEYS.USERNAME)

    if (accessToken && username) {
      connect.setAccessToken(accessToken)

      state.auth.accessToken = accessToken
      state.auth.username = username
    }

    emitter.emit('render')
  }

  function clearSession () {
    storage.removeItem(KEYS.ACCESS_TOKEN)
    storage.removeItem(KEYS.USERNAME)
  }

  // function postComment (comment, callback) {
  //   comment.parentAuthor = comment.parent.split('/')[0].slice(1)
  //   comment.parentPermlink = comment.parent.split('/')[1]
  //   comment.author = state.auth.username
  //   comment.permlink = slugFrom(comment.body)
  //   comment.metadata = {}

  //   return connect.comment(
  //     comment.parentAuthor,
  //     comment.parentPermlink,
  //     comment.author,
  //     comment.permlink,
  //     comment.title,
  //     comment.body,
  //     comment.metadata,
  //     callback
  //   )
  // }
}

function createConnectAPI () {
  var api = sc2.Initialize({
    app: process.env.CONNECT_ACCOUNT,
    callbackURL: process.env.HOST + process.env.CALLBACK_ROUTE,
    accessToken: 'access_token',
    scope: [ 'comment', 'vote' ]
  })

  api.setBaseURL(process.env.BASE_URL)

  return api
}

function draft (author, category, title, content, callback) {
  var opts = {
    method: 'POST',
    url: process.env.API_URL + '/topics',
    json: true,
    headers: { authorization: connect.options.accessToken },
    body: {
      author,
      category,
      title,
      slug: slugFrom(title),
      content
    }
  }

  request(opts, callback)
}

function broadcast (author, category, title, content, callback) {
  var slug = slugFrom(title)

  var parentAuthor = process.env.APP_ACCOUNT
  var parentPermlink = process.env.APP_ACCOUNT + '-topics'

  var metadata = {
    'app': 'tokenbb/0.1',
    'format': 'markdown',
    'tags': [
      'tokenbb'
    ],
    'images': [],
    'videos': [],
    'tokenbb': {
      'type': 'topic',
      'app': process.env.APP_ACCOUNT,
      'slug': slug,
      'author': author,
      'title': title,
      'category': category || null,
      'tags': []
    }
  }

  return connect.comment(
    parentAuthor,
    parentPermlink,
    author,
    slug,
    title,
    content,
    metadata,
    callback
  )
}

function publish (topicId, callback) {
  var opts = {
    method: 'PATCH',
    url: process.env.API_URL + '/topics/' + topicId,
    json: true,
    headers: { authorization: connect.options.accessToken },
    body: {
      status: 'publish'
    }
  }

  request(opts, callback)
}

function slugFrom (text) {
  return removeSpecialChars(text.toLowerCase()).split(' ').join('-').slice(0, 63)
}

function removeSpecialChars (str) {
  return str.replace(/[^\w\s]/gi, '')
}
