import * as types from "./actionTypes"

export function addTab({
  viewPath,
  tab
}) {
  return ({
    type: types.ADD_TAB,
    payload: arguments[0]
  })
}

export function closeTab({
  view,
  viewPath,
  tabId,
  tabIndex
}) {
  return ({
    type: types.CLOSE_TAB,
    payload: arguments[0]
  })
}

export function splitView({
  view,
  viewPath,
  direction,
}) {
  return ({
    type: types.SPLIT_VIEW,
    payload: arguments[0]
  })
}

export function changeTab({
  viewPath,
  tabId
}) {
  return ({
    type: types.CHANGE_TAB,
    payload: arguments[0]
  })
}

export function setTabs({
  viewPath,
  newTabs
}) {
  return ({
    type: types.SET_TABS,
    payload: arguments[0]
  })
}

export function deleteView({
  viewPath
}) {
  return ({
    type: types.DELETE_VIEW,
    payload: arguments[0]
  });
}

export function refreshView({
  tabs,
  tabImgs
}) {
  return ({
    type: types.REFRESH_VIEW,
    payload: arguments[0]
  })
}

export function setViewTree({
  viewTree
}) {
  return ({
    type: types.SET_VIEW_TREE,
    payload: arguments[0]
  })
}

export function setTabImgs({
  tabImgs
}) {
  return ({
    type: types.SET_TAB_IMGS,
    payload: arguments[0]
  })
}

export function setTabEdit({
  viewPath,
  isEditing,
  tabIndex
}) {
  return ({
    type: types.SET_TAB_EDIT,
    payload: arguments[0]
  })
}

export function setTabContent({
  viewPath,
  content,
  tabIndex
}) {
  return ({
    type: types.SET_TAB_CONTENT,
    payload: arguments[0]
  })
}

export function setViewMode({
  viewPath,
  viewMode
}) {
  return ({
    type: types.SET_VIEW_MODE,
    payload: arguments[0]
  })
}