const KEYS = {
  ACCESS_TOKEN: process.env.APP + ':access-token',
  USERNAME: process.env.APP + ':username'
}

var steem = require('@steemit/steem-js')
var sc2 = require('sc2-sdk')
var request = require('request')

var storage = window.sessionStorage
var connect = createConnectAPI()

steem.api.setOptions({ url: 'wss://' + process.env.STEEMD_URL })
steem.config.set('address_prefix', process.env.ADDRESS_PREFIX)
steem.config.set('chain_id', process.env.CHAIN_ID)

module.exports = store

function store (state, emitter, app) {
  state.app = {
    loginURL: connect.getLoginURL()
  }

  state.topics = {
    loading: true,
    posting: false,
    list: []
  }

  resetAuthState()

  emitter.on('DOMContentLoaded', () => {
    emitter.on('logout', logout)

    onInit()
  })

  function onInit () {
    if (state.query.access_token) storeSession()

    loadTopics()
    loadSession()

    emitter.emit('render')
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

      state.topics.list = res.body
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

  function postComment (comment, callback) {
    comment.parentAuthor = comment.parent.split('/')[0].slice(1)
    comment.parentPermlink = comment.parent.split('/')[1]
    comment.author = state.auth.username
    comment.permlink = buildPermlink(comment.body)
    comment.metadata = {}

    return connect.comment(
      comment.parentAuthor,
      comment.parentPermlink,
      comment.author,
      comment.permlink,
      comment.title,
      comment.body,
      comment.metadata,
      callback
    )
  }
}

function createConnectAPI () {
  var api = sc2.Initialize({
    app: process.env.APP,
    callbackURL: process.env.HOST + process.env.CALLBACK_ROUTE,
    accessToken: 'access_token',
    scope: [ 'comment', 'vote' ]
  })

  api.setBaseURL(process.env.BASE_URL)

  return api
}

function buildPermlink (text) {
  return removeSpecialChars(text.toLowerCase()).split(' ').join('-').slice(0, 63)
}

function removeSpecialChars (str) {
  return str.replace(/[^\w\s]/gi, '')
}
