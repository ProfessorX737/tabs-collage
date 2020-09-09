import React from "react";
import PropTypes from "prop-types";
import SortableTabs from "./sortable-tabs";
import "./domain-viewer.css";
import Domain from './domain';

export default class DomainViewer extends React.PureComponent {
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
            <React.Fragment>
              <SortableTabs
                view={this.props.view}
                viewPath={this.props.viewPath}
              />
              <Domain
                view={this.props.view}
                viewPath={this.props.viewPath}
              />

            </React.Fragment>
          )}
      </div>
    );
  }
}

DomainViewer.propTypes = {
  view: PropTypes.object.isRequired,
  viewPath: PropTypes.array
};

DomainViewer.defaultProps = {
  viewPath: []
};