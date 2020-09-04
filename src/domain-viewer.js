import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  splitView
} from "./redux/actions"
import DomainTabs from "./domain-tabs";
import "./domain-viewer.css";
import Domain from './domain';

class _DomainViewer extends React.PureComponent {
  render() {
    return (
      <div
        key={this.props.view.id}
        className="domain-viewer"
        style={{
          flexFlow: this.props.view.flexFlow,
        }}
      >
        {this.props.view.children.length > 0 ? (
          this.props.view.children.map((_view, index) => (
            <DomainViewer
              key={_view.id}
              view={_view}
              viewPath={[...this.props.viewPath, "children", index]}
            />
          ))
        ) : (
            // <div
            //   key={this.props.view.id}
            //   className="domain-viewer"
            // >
            <React.Fragment>
              <DomainTabs
                view={this.props.view}
                viewPath={this.props.viewPath}
              />
              <Domain
                view={this.props.view}
                viewPath={this.props.viewPath}
              />

            </React.Fragment>
            // </div>
          )}
      </div>
    );
  }
}

_DomainViewer.propTypes = {
  view: PropTypes.object.isRequired,
  viewPath: PropTypes.array
};

_DomainViewer.defaultProps = {
  viewPath: []
};

const DomainViewer = connect(
  null,
  { splitView }
)(_DomainViewer);

export default DomainViewer;