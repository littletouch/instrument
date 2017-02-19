import React, { Component } from 'react';
import './App.css';
import {sample} from 'lodash'

import firebase from 'firebase'

import {getAllItemIds, getContentByIdAndLang} from './data'

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
        console.log('logged in', user)
        this.setState({user: user})
      }
    })

    getAllItemIds().then( ids => {
      let itemId = sample(ids)
      this.setState({allItemIds: ids})

      getContentByIdAndLang(itemId, 'en').then( item => {
        this.setState({
          link: item.url,
          name: item.title
        })
      })

    })
  }

  handleLogin() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      console.log('login result', result)
      var token = result.credential.accessToken;
      var user = result.user;
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
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
        <h2>Welcome to Instrument</h2>
        {loginInfo}
        <h3> The world has {this.state.allItemIds.length} musicial instruments. </h3>
        <p>And here comes <a href={this.state.link}>{this.state.name}</a>.</p>
      </div>
    );
  }
}

export default App;
