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
    this.state = {
      initialized: false
    }
  }

  componentDidMount() {
    try {
      chrome.init(() => {
        this.setState({ initialized: true });
      });
    } catch (e) {
      this.props.refreshView({ tabs: sampleData2, tabImgs: sampleImgs });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.initialized) return;
    try {
      assert.notDeepEqual(prevProps.viewTree, this.props.viewTree);
      // try {
      //   chrome.saveViewTree();
      // } catch (e) {
      // they are different update the view in local storage
      const viewTreeJson = JSON.stringify(this.props.viewTree);
      console.log(`saving ${viewTreeJson}`);
      localStorage.setItem(
        constants.LOCAL_STORAGE_KEY,
        viewTreeJson
      );
      // }
    } catch (e) { }
  }

  render() {
    return (
      <div className="App">
        <div className="viewport">
          <DomainViewer
            view={this.props.viewTree}
          />
        </div>
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