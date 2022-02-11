import update from "immutability-helper";
import * as constants from '../../constants';
import { v1 as uuidv1 } from "uuid";
import {
  getUpdateAtPathOb,
  removeListItemAtPath,
  getFirstLeafNodePath
} from "../../tree-utils"
import * as types from "../actionTypes"

const defaultViewTree = {
  id: "1",
  currTabId: "all",
  tabs: [{ id: "all", content: "all" }],
  children: [],
  viewMode: constants.VIEW_MODE.grid
}

const initialState = {
  viewTree: {
    ...defaultViewTree,
    flexFlow: constants.VIEW_DIRECTION.row,
    children: [
      {
        ...defaultViewTree,
        id: "2",
        flexFlow: constants.VIEW_DIRECTION.column,
        children: [
          { ...defaultViewTree, id: "4" },
          { ...defaultViewTree, id: "5" },
        ]
      },
      {
        ...defaultViewTree,
        id: "3",
        flexFlow: constants.VIEW_DIRECTION.column,
        children: [
          { ...defaultViewTree, id: "6" },
          { ...defaultViewTree, id: "7" },
        ]
      },
    ]
  },
  domains: {},
  domainIconUrl: {},
  tabImgs: {},
  websites: {},
  chromeTabMap: {},
}

export default function (state = initialState, action) {
  switch (action.type) {
    case types.ADD_TAB: {
      const {
        viewPath,
        tab
      } = action.payload;
      const updateOp = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            tabs: {
              $push: [tab]
            },
            currTabId: {
              $set: tab.id
            }
          }
        })
      }
      return update(state, updateOp);
    }
    case types.CLOSE_TAB: {
      const {
        view,
        viewPath,
        tabId,
        tabIndex
      } = action.payload;
      const isCurrTab = view.currTabId === tabId;
      let newCurrTabId = view.currTabId;
      if (isCurrTab) {
        const inc = tabIndex === view.tabs.length - 1 ? -1 : 1;
        newCurrTabId = view.tabs[tabIndex + inc]?.id || 0;
      }
      const updateOp = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            tabs: {
              $splice: [[tabIndex, 1]]
            },
            currTabId: { $set: newCurrTabId }
          }
        })
      }
      return update(state, updateOp);
    }
    case types.SPLIT_VIEW: {
      const {
        view,
        viewPath,
        direction,
      } = action.payload;
      const newView = {
        id: view.id,
        flexFlow: direction,
        tabs: [],
        tabsView: {},
        children: [
          { ...update(view, {}), id: uuidv1() },
          {
            ...defaultViewTree,
            id: uuidv1()
          }
        ]
      }
      const updateOp = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            $set: newView
          }
        })
      }
      return update(state, updateOp);
    }
    case types.CHANGE_TAB: {
      const {
        viewPath,
        tabId
      } = action.payload;
      const updateOp = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            currTabId: {
              $set: tabId
            }
          }
        })
      }
      return update(state, updateOp);
    }
    case types.SET_TABS: {
      const {
        viewPath,
        newTabs
      } = action.payload;
      const updateOp = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            tabs: {
              $set: newTabs
            }
          }
        })
      }
      return update(state, updateOp)
    }
    case types.DELETE_VIEW: {
      const {
        view,
        viewPath
      } = action.payload;
      // remove the view
      let newViewTree = removeListItemAtPath({
        treeData: state.viewTree,
        path: viewPath
      })
      // simplify the view
      newViewTree = simplifyView(newViewTree);
      // push all tabs in the removed view to the first view
      const firstView = getFirstLeafView(newViewTree);
      const firstViewPath = getFirstLeafNodePath({ view: newViewTree });
      let ids = new Set();
      let newTabs = [];
      firstView.tabs.forEach(tab => {
        ids.add(tab.id);
      })
      // if first view does not have tab and it is a domain tab 
      // then push it on
      view.tabs.forEach(tab => {
        if (!ids.has(tab.id) && !tab.regex) newTabs.push(tab);
      })
      newViewTree = update(newViewTree, getUpdateAtPathOb({
        treeData: newViewTree,
        path: firstViewPath,
        update: {
          tabs: {
            $push: newTabs
          }
        }
      })
      )
      return update(state, {
        viewTree: {
          $set: newViewTree
        }
      })
    }
    case types.REFRESH_VIEW: {
      const {
        tabs,
        tabImgs
      } = action.payload;
      let domains = {};
      let domainIconUrl = {};
      let chromeTabMap = {};
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const url = tab.url ? tab.url : tab.pendingUrl;
        chromeTabMap[tab.id] = tab;
        const domain = getDomainFromUrl(url);
        if (domains[domain]) {
          domains[domain].push(tab);
        } else {
          domains[domain] = [tab];
        }
        // use the given favIconUrl for domain if it exists
        const icon = tab.favIconUrl;
        if (icon) domainIconUrl[domain] = icon;
      }
      let domainSet = new Set(Object.keys(domains));
      let viewTreeCopy = JSON.parse(JSON.stringify(state.viewTree));
      cleanView(viewTreeCopy, domains, domainSet, chromeTabMap);
      let firstView = getFirstLeafView(viewTreeCopy);
      domainSet.forEach(domain => {
        const id = uuidv1();
        firstView.tabs.push({
          id,
          content: domain
        });
      })
      return {
        ...state,
        viewTree: viewTreeCopy,
        domains,
        domainIconUrl,
        tabImgs,
        websites: tabs,
        chromeTabMap,
      }
    }
    case types.SET_VIEW_TREE: {
      const {
        viewTree
      } = action.payload;
      const updateOb = {
        viewTree: {
          $set: viewTree
        }
      }
      return update(state, updateOb);
    }
    case types.SET_TAB_IMGS: {
      const {
        tabImgs
      } = action.payload;
      const updateOb = {
        tabImgs: {
          $set: tabImgs
        }
      }
      return update(state, updateOb);
    }
    case types.SET_TAB_EDIT: {
      const {
        viewPath,
        isEditing,
        tabIndex
      } = action.payload;
      const updateOb = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            tabs: {
              [tabIndex]: {
                $merge: {
                  isEditing
                }
              }
            }
          }
        })
      }
      return update(state, updateOb);
    }
    case types.SET_TAB_CONTENT: {
      const {
        content,
        viewPath,
        tabIndex
      } = action.payload;
      const updateOb = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            tabs: {
              [tabIndex]: {
                $merge: {
                  content
                }
              }
            }
          }
        })
      }
      return update(state, updateOb);
    }
    case types.SET_VIEW_MODE: {
      const {
        viewPath,
        viewMode
      } = action.payload;
      const updateOb = {
        viewTree: getUpdateAtPathOb({
          treeData: state.viewTree,
          path: viewPath,
          update: {
            viewMode: {
              $set: viewMode
            }
          }
        })
      }
      return update(state, updateOb);
    }
    default: {
      return state;
    }
  }
}

const cleanView = (view, domains, domainSet, chromeTabMap) => {
  let newViewTabs = [];
  for (let i = 0; i < view.tabs.length; i++) {
    let tab = view.tabs[i];
    const name = tab.content;
    // only add to newViewTabs if this domain still exists
    if (name === "all" || domains[name] || tab.regex) {
      // remove this domain from domainSet so at the end we can
      // find out which domains are new and add them to a view
      domainSet.delete(name);
      newViewTabs.push(tab);
    }
  }
  view.tabs = newViewTabs;
  for (let i = 0; i < view.children.length; i++) {
    cleanView(view.children[i], domains, domainSet);
  }
}

const getFirstLeafView = view => {
  if (view.children.length === 0) {
    // the is a leaf view so return the view id
    return view
  }
  // recursively find the first view
  return getFirstLeafView(view.children[0]);
}

const getDomainFromUrl = url => {
  return url.match(/^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/)[1];
}

const simplifyView = view => {
  if (view.children.length === 1) {
    view = view.children[0];
  }
  for (let i = 0; i < view.children.length; i++) {
    view.children[i] = simplifyView(view.children[i]);
  }
  return view;
};