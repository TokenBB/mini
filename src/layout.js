var html = require('choo/html')

module.exports = layout

function layout (view) {
  return function (state, emit) {
    return html`
      <body>
        <section class="section">
          ${profile(state, emit)}
          <hr>
          ${view(state, emit)}
        </section>
      </body>`
  }
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
