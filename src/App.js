/*global chrome*/
import React from "react";
import "./styles.css";
import ViewPort from "./view-port";
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
    document.addEventListener("visibilitychange", this.onFocus);
    this.onFocus();
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.onFocus);
  }

  onFocus = () => {
    if(document.visibilityState === 'visible') {
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
      console.log(sampleData2)
      this.props.refreshView({ tabs: sampleData2 })
      this.props.setUrlImgs({ urlImgs: sampleImgs });
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
      <div className="App" style={{ overflow: "hidden" }}>
        <ViewPort>
          <DomainViewer
            view={this.props.viewTree}
          />
        </ViewPort>
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