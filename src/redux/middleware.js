import * as types from "./actionTypes";
import * as actions from "./actions";
import * as constants from '../constants';
// import * as chrome from '../chrome-api';

const refreshViewLogic = store => next => async action => {
  if (action.type === types.REFRESH_VIEW) {
    // try {
    //   chrome.restoreSavedViewTree(() => {
    //     next(action);
    //   })
    // } catch (e) {
      const lsKey = constants.LOCAL_STORAGE_KEY;
      const viewTreeJson = await localStorage.getItem(lsKey);
      if (viewTreeJson) {
        // set viewTree with oldView
        const viewTree = JSON.parse(viewTreeJson);
        next(actions.setViewTree({ viewTree }));
      }
      next(action);
    // }
  } else {
    next(action);
  }
}

export default [
  refreshViewLogic
];
