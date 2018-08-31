var html = require('choo/html')

module.exports = newTopic

function newTopic (state, emit) {
  return html`
    <div>
      <a href="/">◄ Back</a> 

      <h2 class="title is-1">Create a New Topic</h2>

      <form style="width: 500px;" onsubmit=${onSubmit}>
        <div class="level">
          <div class="level-item">
            <input name="title" type="text" class="input" placeholder="Type title here">
          </div>

          <div class="level-item">
            <select name="category" class="select">
              <option>uncategorized</option>
            </select>
          </div>
        </div>

        ${editor(state, emit)}

        <div class="field">
          <div class="control">
            <button role="submit" 
              class="button is-primary ${state.topics.posting ? 'is-loading' : ''}">
              Create Topic
            </button>
          </div>
        </div>
      </form>

    </div>`

  function onSubmit (e) {
    e.preventDefault()

    emit('create-topic', e.target)
  }
}

function editor (state, emit) {
  return html`
    <div class="field">
      <div class="control">
        <textarea name="content" 
          class="textarea" 
          placeholder="Type here." 
          style="width: 450px;"></textarea>
      </div>
    </div>`
}
