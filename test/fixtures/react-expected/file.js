import dep from './src/dep'
import extDep from 'src/dep2'
import unused from 'path'
import React, {PropTypes} from 'react'

export default React.createClass({
  propTypes: {
    children: PropTypes.element,
    unused: PropTypes.number,
  },
  renderOther() {
    return <a className="foobar">Hey</a>
  },
  render() {
    return (
      <div
        className="container"
        onClick={dep}
        onBlur={this.renderOther}>
        <h1>Home</h1>
        <Link to="contact">Contact</Link>
        {this.props.children}
      </div>
    )
  },
  render2() {
    extDep()
  },
})

document.body.appendChild(localStorage.setItem(''))
