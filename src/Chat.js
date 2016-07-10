import React from 'react'
import io from 'socket.io-client'

class Chat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:[],
      userName:'',
      color:'green',
      connectedUsers:[]
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUserSubmit = this.handleUserSubmit.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  componentDidMount () {
    var that = this
    this.socket = io('/')
    var user = {name:this.state.userName}
    this.socket.emit('userConnect', user)

    this.socket.on('userConnect', user => {
      console.log(user.defaultName)
      console.log(user.name)
      var notificationName

      if (user.name == '') {
        notificationName = user.defaultName
      } else notificationName = user.name
      //this.state.connectedUsers.push(user)
      this.setState({ connectedUsers: [user, ...this.state.connectedUsers] })
      Materialize.toast('User: '+notificationName+' connected', 4000, 'teal lighten-2')
      console.log(this.state.connectedUsers)
    })

    this.socket.on('message', message => {
      //console.log(message)
      this.setState({ messages: [message, ...this.state.messages] })
    })

    this.socket.on('changed name', user => {
      this.state.connectedUsers.map((userList) => {
        if (userList.defaultName === user.originalName) {
          userList.name = user.name
        }
      })
      this.setState({connectedUsers: [...this.state.connectedUsers]})

      Materialize.toast(user.originalName+' changed name to: '+user.name, 4000, 'teal lighten-2')
    })

    this.socket.on('user disconnected', user => {
      Materialize.toast('User: '+user.id+' disconnected', 4000, 'teal lighten-2')
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
      this.setState({userName: name})  // if user changes name set it as state, and emit to socket.io
      this.socket.emit('changed name', name)
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
