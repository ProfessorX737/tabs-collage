import React from "react";
import "./App.css";
import DomainViewer from "./domain-viewer";
import assert from "assert";
import { connect } from "react-redux";
import {
  refreshView
} from "./redux/actions";
import * as constants from './constants';
import sampleData2 from './sampleData2';
import sampleImgs from './sampleImgs';
import * as chrome from './chrome-api';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener("blur", () => {
      if (this.blurFilter) this.blurFilter.style.display = 'block';
    })
    window.addEventListener("focus", () => {
      if (this.blurFilter) this.blurFilter.style.display = 'none';
    })
    // this.onFocus();
    // chrome.runtime.sendMessage('init_capture');
    // chrome.runtime.onMessage.addListener(data => {
    //   this.props.refreshView(data);
    // })
    try {
      chrome.init();
    } catch (e) {
      this.onFocus();
    }
  }

  onFocus = () => {
    // chrome.tabs.query({ status: 'complete' }, tabs => {
    //   console.log(JSON.stringify(tabs));
    //   this.props.refreshView({ tabs });
    // })
    // chrome.runtime.sendMessage('', urlImgs => {
    //   console.log(urlImgs)
    //   if(urlImgs) {
    //     this.props.setUrlImgs({ urlImgs });
    //   }
    this.props.refreshView({ tabs: sampleData2, tabImgs: sampleImgs });
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
          ref={el => { this.blurFilter = el }}
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
    refreshView
  }
)(App);