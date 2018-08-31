var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Tabs extends Component {
  constructor (name, state, emit) {
    super(name)

    this.name = name
    this.state = state
    this.emit = emit

    this.selected = null

    this.select = this.select.bind(this)
  }

  update () {
    return false
  }

  createElement (tabs) {
    if (!this.selected) this.selected = tabs[0]

    this.el = html`
      <div class="tabs">
        <ul>
          ${tabs.map(tab => html`
            <li class=${tab === this.selected ? 'is-active' : ''}>
              <a onclick=${e => this.select(tab)}>
                ${tab.name}
              </a>
            </li>
          `)}
        </ul>
      </div>`

    return this.el
  }

  select (tab) {
    this.selected = tab
    this.emit(`tabs:${this.name}:select`, tab)
    this.rerender()
  }
}
