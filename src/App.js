/*global chrome*/
import React from "react";
import "./App.css";
import DomainViewer from "./domain-viewer";
import assert from "assert";
import { connect } from "react-redux";
import {
  refreshView,
  setUrlImgs
} from "./redux/actions";
import * as constants from './constants';
import sampleData2 from './sampleData2';
import sampleImgs from './sampleImgs';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.onFocus();
    window.addEventListener("blur", () => { 
      if(this.blurFilter) this.blurFilter.style.display = 'block';
    })
    window.addEventListener("focus", () => { 
      if(this.blurFilter) this.blurFilter.style.display = 'none';
    })
  }

  onFocus = () => {
    console.log(document.visibilityState)
    if (document.visibilityState === 'visible') {
      // chrome.tabs.query({ status: 'complete' }, tabs => {
      //   console.log(JSON.stringify(tabs));
      //   this.props.refreshView({ tabs });
      // })
      // chrome.runtime.sendMessage('', urlImgs => {
      //   console.log(urlImgs)
      //   if(urlImgs) {
      //     this.props.setUrlImgs({ urlImgs });
      //   }
      // })
      this.props.refreshView({ tabs: sampleData2, urlImgs: sampleImgs });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    try {
      assert.deepEqual(prevProps.viewTree, this.props.viewTree);
    } catch (e) {
      // they are different update the view in local storage
      localStorage.setItem(
        constants.LOCAL_STORAGE_KEY,
        JSON.stringify(this.props.viewTree)
      );
    }
  }

  render() {
    return (
      <div className="App">
        <div className="viewport">
          <DomainViewer
            view={this.props.viewTree}
          />
        </div>
        <div 
        ref={el => {this.blurFilter = el}}
        className="blur-filter"
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  viewTree: state.view.viewTree,
  domains: state.view.domains
})

export default connect(
  mapStateToProps,
  {
    refreshView,
    setUrlImgs
  }
)(App);