import React from "react";
import "./sortable-tabs.css";
import { ReactSortable } from "react-sortablejs";
import PropTypes from "prop-types";
import Add from "@material-ui/icons/Add";
import { Scrollbars } from "react-custom-scrollbars";
import { connect } from "react-redux";
import {
  changeTab,
  setTabs,
  addTab
} from "./redux/actions";
import assert from "assert";
import ViewOptions from "./view-options";
import ReactResizeDetector from 'react-resize-detector';
import Tab from './tab';
import { v1 as uuidv1 } from 'uuid';

class SortableTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabWidth: 70
    }
    this.myrefs = {};
    this.tabIdCount = {};
  }

  componentDidMount() {
    this.setTabWidth();
  }

  componentDidUpdate(prevProps) {
    try {
      assert.notDeepEqual(prevProps.view.tabs, this.props.view.tabs);
      this.setTabWidth();
    } catch (e) { }
  }

  onChangeTab = tabId => {
    if (this.props.view.currTabId !== tabId) {
      this.props.changeTab({
        viewPath: this.props.viewPath,
        tabId
      })
    }
  };

  setTabRef = (el, tabId) => {
    const key = `tab${tabId}`;
    if (this.myrefs[key] === undefined && el) {
      el.scrollIntoView();
      this.myrefs[key] = el;
    }
  };

  // to prevent jsx from complaining about duplicate element keys
  // append the count of the id to the id
  getTabKey = tabId => {
    let count = this.tabIdCount[tabId];
    count = Boolean(count) ? count + 1 : 1;
    this.tabIdCount[tabId] = count;
    return `${tabId}_${count}`;
  };

  handleSort = evt => {
    if (evt.pullMode) {
      const tabs = this.props.view.tabs;
      if (evt.to === this.myrefs["sortable-tabs"]) {
        // a tab was dropped in from another list
        const id = tabs[evt.newIndex].id;
        this.onChangeTab(id);
      } else if (evt.from === this.myrefs["sortable-tabs"]) {
        // a tab was dropped into another list
        if (tabs.length === 0) {
          this.onChangeTab(0);
        } else {
          for (let i = 0; i < tabs.length; i++) {
            const tabId = tabs[i].id;
            if (tabId === this.props.view.currTabId) {
              return;
            }
          }
          const inc = evt.oldIndex === tabs.length ? -1 : 0;
          const ntab = this.props.view.tabs[evt.oldIndex + inc];
          this.onChangeTab(ntab.id);
        }
      }
    }
  };

  onSetTabs = newTabs => {
    try {
      assert.notDeepEqual(this.props.view.tabs, newTabs);
      this.props.setTabs({
        viewPath: this.props.viewPath,
        newTabs
      })
    } catch (e) {}
  }

  setTabWidth = () => {
    const numTabs = this.props.view.tabs.length;
    const availWidth = this.myrefs['scrollbar'].getClientWidth();
    const tabWidth = availWidth / numTabs;
    this.setState({ tabWidth });
  }

  onAddTab = () => {
    this.props.addTab({
      viewPath: this.props.viewPath,
      tab: {
        id: uuidv1(),
        content: "",
        regex: true,
        isEditing: true
      }
    });
  }

  render() {
    this.tabIdCount = {};
    return (
      <div
        className="sortable-tabs-toolbar"
        onWheel={e => {
          e.stopPropagation();
          const delta = this.myrefs.scrollbar.getScrollLeft();
          this.myrefs["scrollbar"].scrollLeft(delta + e.deltaY);
          return false;
        }}
      >
        <Scrollbars
          ref={el => {
            this.myrefs["scrollbar"] = el;
          }}
          style={{ height: "3em" }}
          autoHide
        >
          <ReactSortable
            ref={el => {
              this.myrefs["sortable-tabs"] = el?.ref?.current;
            }}
            list={this.props.view.tabs}
            setList={tabs => { this.onSetTabs(tabs) }}
            className="sortable-tabs"
            filter=".all-tab"
            onSort={evt => { this.handleSort(evt) }}
            group={{
              name: "tabs",
              // only allow incoming tab if not already in our tabs
              put: (to, from, el) => {
                const children = to.el.children;
                for (let i = 0; i < children.length; i++) {
                  if (children[i].id === el.id) return false;
                }
                return true;
              },
              pull: (to, from, el) => {
                if (el.id === "all") return false;
                if (to.options.group.name === "tabs") {
                  return true;
                }
                return false;
              }
            }}
          >
            {this.props.view.tabs.map((tab, index) => {
              return (
                <Tab
                  key={tab.id}
                  tab={tab}
                  tabIndex={index}
                  view={this.props.view}
                  viewPath={this.props.viewPath}
                  tabWidth={this.state.tabWidth}
                />
              )
            })}
          </ReactSortable>
          <ReactResizeDetector
            handleWidth
            handleHeight
            onResize={() => {
              this.setTabWidth();
            }}
          />
        </Scrollbars>
        <div
          className="add-tab-btn"
          onClick={this.onAddTab}
        >
          <Add fontSize="small" />
        </div>
        <ViewOptions
          view={this.props.view}
          viewPath={this.props.viewPath}
        />
      </div>
    );
  }
}

SortableTabs.propTypes = {
  view: PropTypes.object.isRequired,
  viewPath: PropTypes.array.isRequired
};

export default connect(
  null,
  {
    changeTab,
    setTabs,
    addTab
  }
)(SortableTabs)
