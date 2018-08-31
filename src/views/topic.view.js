var html = require('choo/html')

module.exports = view

function view (state, emit) {
  var topic = state.topics.list.find(t => t.id === state.params.topicId)

  if (!topic) return ''

  topic.replies = []

  return html`
    <div>
      <a href="/">◄ Back</a> 

      <h2 class="title is-1">${topic.title}</h2>
      <p>${topic.category}</p>

      ${post(topic, emit)}

      ${topic.replies.map(r => reply(r, emit))}

      <hr>

      ${addReply(state, emit)}
    </div>`
}

function post (topic, emit) {
  return html`
  <div>

    <hr>

    <div class="columns">
      <div class="column is-narrow">
        <figure class="image" style="width: 64px; height: 64px; display: inline-block; padding: 0 2px;">
         <img class="is-rounded" src="https://bulma.io/images/placeholders/256x256.png">
        </figure>
      </div>
      <div class="column is-8">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              ${topic.author}
            </div>
          </div>

          <div class="level-right">
            <p class="level-item">
              ${new Date(topic.postedOn).toLocaleString()}
            </p>
          </div>
        </nav>

        <div class="content">
          ${topic.content}
        </div>
        
      </div>
    </div>
  </div>`
}

function reply (data, emit) {
  return html`
    <div>

      <hr>

      <div class="columns">
        <div class="column is-narrow">
          <figure class="image" style="width: 64px; height: 64px; display: inline-block; padding: 0 2px;">
           <img class="is-rounded" src="https://bulma.io/images/placeholders/256x256.png">
          </figure>
        </div>
        <div class="column is-8">
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                ${data.postedBy}
              </div>
            </div>

            <div class="level-right">
              <p class="level-item">
                ${new Date(data.postedOn).toLocaleString()}
              </p>
            </div>
          </nav>

          ${ipsum2()}
          
        </div>
      </div>

    </div>`
}

function addReply (state, emit) {
  if (!state.auth.accessToken) return ''

  return html`
    <form style="width: 500px;" onsubmit=${onSubmit}>
      <div class="field">
        <div class="control">
          <textarea class="textarea" placeholder="Type here." style="width: 450px;"></textarea>
        </div>
      </div>
    
      <div class="field">
        <div class="control">
          <button role="submit" class="button is-primary ${state.topics.posting ? 'is-loading' : ''}">
            Reply
          </button>        
        </div>
      </div>
    </form>`

  function onSubmit (e) {
    e.preventDefault()

    emit('add-comment', e.target.comment.value)
  }
}

function ipsum () {
  return html`<div class="content">
    <p>Ex officia consectetur turkey eu shank. 
    Dolore ea consectetur mollit duis anim brisket meatball sausage id ham hock. 
    Meatloaf ipsum esse sausage labore. Cupim ground round chuck strip steak chicken ea 
    officia velit sausage. Anim meatball ea, fugiat chuck salami nisi mollit adipisicing. 
    Pork loin et cupim capicola est pariatur short loin alcatra esse tri-tip. 
    Bresaola porchetta salami exercitation commodo irure.</p>

    <p>Veniam est strip steak enim reprehenderit pork, fugiat kevin esse sausage 
    pastrami adipisicing prosciutto hamburger commodo. Duis proident turducken 
    incididunt eiusmod rump bacon dolore. Frankfurter beef aliquip, sirloin in id 
    capicola bacon nisi tongue swine. Eu adipisicing ground round capicola ham lorem 
    anim dolore sirloin. Tongue corned beef porchetta in ex. Ullamco eu turkey, 
    andouille reprehenderit nostrud ham deserunt sirloin burgdoggen nisi cow buffalo.</p> 

    <p>Fatback meatloaf tri-tip tail est voluptate.</p></div>`
}

function ipsum2 () {
  return html`
    <div class="content">
      <p>Cupim ground round chuck strip steak chicken ea 
      officia velit sausage. Anim meatball ea, fugiat chuck salami nisi mollit adipisicing. 
      Pork loin et cupim capicola est pariatur short loin alcatra esse tri-tip. 
      Bresaola porchetta salami exercitation commodo irure.
      </p>
    </div>`
}
