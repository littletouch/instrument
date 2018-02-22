import React, { PureComponent } from 'react'
import AV from 'leancloud-storage'

import './App.css'

import { getUserHistory, getNewItemByHistory } from './data'
class SignUp extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      username: '',
      errorMessage: ''
    }
  }

  handleEmailChange = (event) => {
    this.setState({ email: event.target.value })
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value })
  }

  handleSumbit = async (event) => {
    event.preventDefault()

    const { email, password, username } = this.state
    const user = new AV.User()
    user.setEmail(email)
    user.setPassword(password)
    user.setUsername(username)

    try {
      await user.signUp()
      console.log(AV.User.current())
      this.props.callback()
    } catch (error) {
      console.error(error)
      this.setState({ errorMessage: error.message })
    }
  }

  render () {
    const { email, password, username, errorMessage } = this.state
    return (
      <section>
        {
          errorMessage && <span>{ errorMessage }</span>
        }
        <form onSubmit={this.handleSumbit}>
          <label>Username:
            <input required={true} type="text" value={username} onChange={this.handleUsernameChange}/>
          </label>
          <label>Email:
            <input required={true} type="email" value={email} onChange={this.handleEmailChange}/>
          </label>
          <label>Password:
            <input required={true} type="password" value={password} onChange={this.handlePasswordChange}/>
          </label>
          <input type="submit" value="Sign up"/>
        </form>
      </section>
    )
  }
}

class Login extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      errorMessage: ''
    }
  }

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value })
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleSumbit = async (event) => {
    event.preventDefault()

    const { username, password } = this.state

    try {
      await AV.User.logIn(username, password)
      this.props.callback()
      console.log(AV.User.current())
    } catch (error) {
      console.error(error)
      this.setState({ errorMessage: error.message })
    }
  }

  render () {
    const { username, password, errorMessage } = this.state
    return (
      <section>
        {
          errorMessage && <span>{ errorMessage }</span>
        }
        <form onSubmit={this.handleSumbit}>
          <label>Username:
            <input required={true} type="text" value={username} onChange={this.handleUsernameChange}/>
          </label>
          <label>Password:
            <input required={true} type="password" value={password} onChange={this.handlePasswordChange}/>
          </label>
          <input type="submit" value="Login"/>
        </form>
      </section>
    )
  }
}

class LoginOrSignUp extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      shouldRenderLogin: true
    }
  }

  handleChange = (event) => {
    event.preventDefault()
    this.setState((prevState) => ({ shouldRenderLogin: !prevState.shouldRenderLogin }))
  }

  render () {
    const { renderLogin, renderSignUp, callback } = this.props
    const { shouldRenderLogin } = this.state

    return (
      <section>
        { shouldRenderLogin ? renderLogin(callback) : renderSignUp(callback) }
        <button onClick={this.handleChange}>{ shouldRenderLogin ? (<span>Sign up</span>) : (<span>Login</span>) }</button>
      </section>
    )
  }
}

class InstrumentToday extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      link: null,
      name: null
    }
  }

  async componentDidMount () {
    const history = await getUserHistory()
    const instrument = await getNewItemByHistory(history)
    history.push({
      id: instrument.id,
      time: new Date()
    })
    const currentUser = AV.User.current()
    currentUser.set('history', history)
    try {
      await currentUser.save()
      this.setState({
        link: instrument.url,
        name: instrument.title
      })
    } catch (error) {
      console.error(error)
    }
  }

  render () {
    const { link, name } = this.state
    return (
      <a target="_blank" href={link}>{name}</a>
    )
  }
}

class App extends PureComponent {
  handleCallback = () => {
    this.forceUpdate()
  }

  render() {
    const currentUser = AV.User.current()
    console.log(currentUser)
    if (!currentUser) {
      return (
        <LoginOrSignUp
          renderLogin={(callback) => (<Login callback={callback}/>)}
          renderSignUp={(callback) => (<SignUp callback={callback}/>)}
          callback={this.handleCallback}
        />
      )
    }

    return (
      <section>
        <p>Hello, { currentUser.getUsername() }</p>
        <InstrumentToday/>
      </section>
    )
  }
}

export default App
