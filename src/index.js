import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Provider } from "react-redux";
import store from "./redux/store";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/init">
        <div>
          loading
        </div>
      </Route>
      <Route path="/">
        <Provider store={store}>
          <App />
        </Provider>
      </Route>
    </Switch>
  </Router>,
  rootElement
);
