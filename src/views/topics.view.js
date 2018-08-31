var html = require('choo/html')
var Dropdown = require('../components/Dropdown')
var Tabs = require('../components/Tabs')

module.exports = topics

function topics (state, emit) {
  if (state.topics.loading) return html`<div class="button is-loading"></div>`

  return html`
    <div class="container">
      ${nav(state, emit)}

      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th style="width: 30%">Topic</th>
            <th style="min-width: 20ex">Category</th>
            <th>Users</th>
            <th>Replies</th>
            <th>Upvotes</th>
            <th>Pending Payout</th>
          </tr>
        </thead>

        <tbody>
          ${formatTopics(state.topics.list)}
        </tbody>

      </table>
    </div>`

  function formatTopics (topics) {
    return topics
      .filter(topic => state.category !== null || topic.category === state.category)
      .map(topic => row(topic, emit))
  }
}

function nav (state, emit) {
  return html`
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <div class="" style="min-width: 12rem; text-align: left;">
          ${state.cache(Dropdown, 'categories').render(state.app.categories)}
          </div>
        </div>
      </div>
      
      <div class="level-item">
        ${state.cache(Tabs, 'tabs').render(state.app.tabs)}
      </div>

      <div class="level-right">
        <div class="level-item">
          <a href="/new" class="button has-icon">
            New Topic
          </a>
        </div>
      </div>
    </nav>`
}

function row (topic, emit) {
  return html`
    <tr class="is-vcentered" style="min-height: 3rem; ">
      <td>
        <a href="/topics/${topic.id}">
          ${topic.title}
        </a>
      </td>
      <td><a>${topic.category}</a></td>
      <td>${(topic.users || []).map(user => avatar(user))}</td>
      <td>${(topic.replies || {}).length}</td>
      <td>${topic.upvotes}</td>
      <td>
        <div class="select is-small">
          <select>
            <option>\$${topic.payout}</option>
          </select>
        </div>
      </td>
    </tr>`
}

function avatar (user) {
  return html`
    <figure class="image" style="width: 24px; height: 24px; display: inline-block; padding: 0 2px;">
     <img class="is-rounded" src="https://bulma.io/images/placeholders/256x256.png">
    </figure>`
}
