import React from 'react'
import io from 'socket.io-client'

class Chat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:[],
      userName:'',
      color:'green'
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUserSubmit = this.handleUserSubmit.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  componentDidMount () {
    var that = this;
    this.socket = io('/')
    this.socket.on('message', message => {
      this.setState({ messages: [message, ...this.state.messages] })
    })

    $(document).ready(function() {
        $('select').material_select();
        $("#colorSelector").on('change', function(event) {
              var color = event.target.value
              that.setState({'color': color})
          })
      })
  }

  handleUserSubmit (event) {
    const name = event.target.value
    if (event.keyCode === 13 && name) {
      this.setState({userName: name})
    }
  }

  handleSubmit (event) {
    const body = event.target.value
      if (event.keyCode === 13 && body) {
        var d = new Date();
        var datetext = d.toTimeString().split(' ')[0]

        const message = {
          body: body,
          from: this.state.userName == '' ? 'Me' : this.state.userName,
          date: datetext
        }

        this.setState({ messages: [message, ...this.state.messages] })
        this.socket.emit('message', message)
        event.target.value = ''
      }
  }

  handleBlur(event) {
    const name = event.target.value
    //console.log(event)
    //console.log(event.target.value)
    if (name) {
      this.setState({userName: name})
    }
  }

  render () {
    const messages = this.state.messages.map((message, index) => {
      return <ul key={index}><li className='card-panel teal lighten-5' key={index} style={{color:this.state.color, 'fontFamily': "Comic Sans MS"}}> {message.date} <b>{message.from}: </b>{message.body}</li></ul>
    });

    return(
        <div style={{'fontFamily': "Comic Sans MS"}}>
          <div className="navbar-fixed">
            <nav className="green">
              <div className="nav-wrapper container green">
                <a href="#" className="brand-logo center green">Pepe Chat 1.0</a>
              </div>
            </nav>
          </div>
          <div className="container">
            <div className="row">
              <h3 style={{fontSize:50}}>
                <img src="http://memesvault.com/wp-content/uploads/Happy-Sad-Frog-20.jpg" width="100px"></img>
                I'm a sad pepe, please talk to me
              </h3>

              <div className="input-field col s6">
                <i className="material-icons prefix">person</i>
                <input disabled={this.state.userName !== ''} id="userNameArea" type='text' placeholder='type in your chat name...' onKeyUp={this.handleUserSubmit} onBlur={this.handleBlur} style={{color:this.state.color}}/>
                <label htmlFor="userNameArea"> Name</label>
              </div>

              <div className="input-field col s6" id='pickerContainer' value={this.state.color} style={{'color':this.state.color}}>
                <select id='colorSelector'>
                  <option value="" disabled defaultValue>Choose your font color</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                </select>
                <label>Font Color</label>
              </div>

              <div className="input-field col s12">
                <i className="material-icons prefix">chat</i>
                <input id='textArea' type='text' placeholder='input a message...' onKeyUp={this.handleSubmit} style={{color:this.state.color}} />
                <label htmlFor="textArea">Message</label>
              </div>
            </div>
            {messages}
          </div>
        </div>
    )
  }
}
export default Chat
