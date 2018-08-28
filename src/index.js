var choo = require('choo')
var html = require('choo/html')
var devtools = require('choo-devtools')
var css = require('sheetify')

css('tachyons')

var app = choo()

app.use(devtools())
app.use(require('./store'))

app.route('*', layout(view))

function view (state, emit) {
  return html`
    <div class="container">
      <h1>mini</h1>

      ${profile(state, emit)}

      ${list(state, emit)}

      ${form(state, emit)}

    </div>`
}

function profile (state, emit) {
  if (state.auth.accessToken === null) return connect(state, emit)

  return html`
    <p>
      currently logged in as ${state.auth.username}
      (<a onclick=${e => emit('logout')}>logout</a>)
    </p>`
}

function connect (state, emit) {
  return html`
    <p>
      <a class="button is-primary" href="${state.app.loginURL}">
        Connect
      </a>
    </p>`
}

function list (state, emit) {
  if (state.posts.loading) return html`<div class="button is-loading"></div>`

  return html`
    <pre>
      <ul>
        ${state.posts.list.slice(-5).map(p => html`<li>@${p.author}: ${p.body}</li>`)}
      </ul>
    </pre>`
}

function form (state, emit) {
  if (!state.auth.accessToken) return ''

  return html`
    <form onsubmit=${onSubmit}>
      <input name="comment" class="input" type="text">

      <button type="submit" class="button ${state.posts.posting ? 'is-loading' : ''}">
        Send
      </button>
    </form>`

  function onSubmit (e) {
    e.preventDefault()

    emit('add-comment', e.target.comment.value)
  }
}

function layout (view) {
  return function (state, emit) {
    return html`
      <body>
        <section class="section">
          ${view(state, emit)}
        </section>
      </body>`
  }
}

app.mount('body')
