import * as types from "./actionTypes";
import * as actions from "./actions";
import assert from 'assert';
import * as constants from '../constants';

const routeStem = "http://localhost:5000/api";

const setCellChildrenLogic = store => next => action => {
  console.log(action.type)
  if (action.type === types.SET_CELL_CHILDREN) {
    const {
      parentId,
      newChildren,
    } = action.payload;
    try {
      const children = store.getState().view.cells[parentId].children;
      assert.notDeepEqual(children, newChildren);
      next(action);
    } catch (e) { }
  } else {
    next(action);
  }
}

const refreshViewLogic = store => next => async action => {
  if (action.type === types.REFRESH_VIEW) {
    const lsKey = constants.LOCAL_STORAGE_KEY;
    const viewTreeJson = await localStorage.getItem(lsKey);
    if (viewTreeJson) {
      console.log('restoring view')
      // set viewTree with oldView
      const viewTree = JSON.parse(viewTreeJson);
      next(actions.setViewTree({ viewTree }));
    }
    next(action);
    // fetch website screenshots we don't have
  } else {
    next(action);
  }
}

export default [
  setCellChildrenLogic,
  refreshViewLogic
];
