import React, { Component } from 'react';
import './App.css';
import {sample} from 'lodash'

import {getAllItemIds, getContentByIdAndLang} from './data'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      allItemIds: [],
      name: '',
      link: '',
    }
  }

  componentDidMount() {
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

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to Instrument</h2>
        </div>

        <h3> The world has {this.state.allItemIds.length} musicial instruments. </h3>
        <p>And here comes <a href={this.state.link}>{this.state.name}</a>.</p>
      </div>
    );
  }
}

export default App;
