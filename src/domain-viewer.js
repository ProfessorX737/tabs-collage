import React from "react";
import PropTypes from "prop-types";
import SortableTabs from "./sortable-tabs";
import "./domain-viewer.css";
import Domain from './domain';

export default class DomainViewer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.isBarDragging = false;
  }

  componentDidMount() {
    if (this.props.view.children.length > 1) {
      this.addDragResizeListeners();
    }
  }

  componentDidUpdate(prevProps) {
    const prevResize = prevProps.view.children.length > 1;
    const currResize = this.props.view.children.length > 1;
    if (prevResize && !currResize) {
      this.removeDragResizeListeners();
    } else if (!prevResize && currResize) {
      this.addDragResizeListeners();
    }
  }

  onMouseDown = evt => {
    if (evt.target === this.resizeBar) {
      this.isBarDragging = true;
    }
  }

  onMouseUp = evt => {
    this.isBarDragging = false;
  }

  onMouseMove = evt => {
    if (!this.isBarDragging || !this.resizeBar || !this.firstView) return false;
    if (this.props.view.flexFlow === "row") {
      const left = this.firstView.offsetLeft;
      const wantWidth = evt.clientX - left;
      const minWidth = 100;
      const newWidth = Math.max(minWidth, wantWidth) + "px ";
      this.firstView.style.minWidth = newWidth;
      this.firstView.style.width = newWidth;
      this.firstView.style.flexGrow = 0;
      this.secondView.style.width = 'auto';
    } else {
      const top = this.firstView.offsetTop;
      const wantWidth = evt.clientY - top;
      const minWidth = 100;
      const newWidth = Math.max(minWidth, wantWidth) + "px";
      this.firstView.style.minHeight = newWidth;
      this.firstView.style.height = newWidth;
      this.firstView.style.flexGrow = 0;
      this.secondView.style.height = 'auto';
    }
  }

  addDragResizeListeners = () => {
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  removeDragResizeListeners = () => {
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  render() {
    return (
      <div
        ref={el => { this.myRef = el; this.props.getRef(el) }}
        key={this.props.view.id}
        className="domain-viewer"
        style={{
          flexFlow: this.props.view.flexFlow,
        }}
      >
        {this.props.view.children.length > 0 ? (
          this.props.view.children.map((_view, index) => (
            <React.Fragment key={_view.id}>
              <DomainViewer
                getRef={el => {
                  if (index === 0) {
                    this.firstView = el
                  } else {
                    this.secondView = el
                  }
                }}
                view={_view}
                viewPath={[...this.props.viewPath, "children", index]}
                isRoot={false}
              />
              {index === 0 &&
                <div
                  ref={el => { this.resizeBar = el }}
                  className={this.props.view.flexFlow === "row" ? "vert-bar" : "horiz-bar"}
                />
              }
            </React.Fragment>
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
  viewPath: PropTypes.array,
  getRef: PropTypes.func,
  isRoot: PropTypes.bool
};

DomainViewer.defaultProps = {
  viewPath: [],
  isRoot: true,
  getRef: () => { }
};