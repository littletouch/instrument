import React, { Component } from 'react';
import './App.css';

import firebase from 'firebase'

import {
    getUserHistoryRefByUid, getAllItemIds,
    getContentByIdAndLang, getNewItemByHistory} from './data'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      allItemIds: [],
      name: '',
      link: '',
      user: null,
    }
  }

  componentDidMount() {
    // Initialize Firebase
    let config = {
      apiKey: "AIzaSyBNuro4DFwwco4tXQ1hHv22AoNAuROwUb8",
      authDomain: "instrument-f0f6e.firebaseapp.com",
      databaseURL: "https://instrument-f0f6e.firebaseio.com",
      storageBucket: "instrument-f0f6e.appspot.com",
      messagingSenderId: "693437483227"
    };

    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged( (user) => {
      if (user) {
        let ref = getUserHistoryRefByUid(user.uid)
        this.setState({user: user})

        ref.once('value').then( (response) => {
          let history = response.val().history || []
          console.log('readed history', history)

          getNewItemByHistory(history).then(item => {
            let newItem = {
              id: item.id,
              time: (new Date()).toString()
            }
            this.setState({
              link: item.url,
              name: item.title
            })
            history.push(newItem)
            ref.set({'history': history})
          })
        })
      }


    })

  }

  handleLogin() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
    }).catch(function(error) {
    });
  }

  render() {
    let {user} = this.state
    let loginInfo

    if (user) {
      loginInfo = (<p>Hello, {user.displayName}</p>)
    } else {
      loginInfo = (<p><button onClick={this.handleLogin} >Login me in please</button></p>)
    }

    return (
      <div className="App">
        {loginInfo}
        <p>And here comes <a href={this.state.link}>{this.state.name}</a>.</p>
      </div>
    );
  }
}

export default App;
