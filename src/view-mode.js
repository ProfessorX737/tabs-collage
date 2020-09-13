import React from 'react';
import {
  ViewListRounded,
  ViewModuleRounded
} from '@material-ui/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  setViewMode
} from './redux/actions';
import './view-mode.css';
import { VIEW_MODE } from './constants';
import clsx from 'clsx';

class ViewMode extends React.Component {

  onClickViewMode = viewMode => {
    this.props.setViewMode({
      viewPath: this.props.viewPath,
      viewMode
    })
  }

  render() {
    const viewMode = this.props.view.viewMode;
    const isList = viewMode === VIEW_MODE.list;
    return (
      <div className="view-mode-wrapper">
        <div
          onClick={() => { this.onClickViewMode(VIEW_MODE.grid) }}
          className={clsx("view-grid-mode", !isList && "view-mode-sel")}
        >
          <ViewModuleRounded />
        </div>
        <div
          onClick={() => { this.onClickViewMode(VIEW_MODE.list) }}
          className={clsx("view-list-mode", isList && "view-mode-sel")}
        >
          <ViewListRounded />
        </div>
      </div>
    )
  }
}

ViewMode.propTypes = {
  view: PropTypes.object.isRequired,
  viewPath: PropTypes.array.isRequired,
}

export default connect(
  null,
  { setViewMode }
)(ViewMode);