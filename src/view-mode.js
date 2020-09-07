import React from 'react';
import {
  List, Apps 
} from '@material-ui/icons';

class ViewMode extends React.Component {

  render() {
    return (
      <div className="view-mode">
        <List/>
        <App/>
      </div>
    )
  }
}