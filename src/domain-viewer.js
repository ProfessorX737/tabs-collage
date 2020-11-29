import React from "react";
import PropTypes from "prop-types";
import SortableTabs from "./sortable-tabs";
import "./domain-viewer.css";
import Domain from './domain';

export default class DomainViewer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isBarDragging: false,
    };
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
      this.setState({ isBarDragging: true });
    }
  }

  onMouseUp = evt => {
    this.setState({ isBarDragging: false });
  }

  onMouseMove = evt => {
    if (!this.state.isBarDragging || !this.resizeBar || !this.firstView) return false;
    if (this.props.view.flexFlow === "row") {
      const left = this.firstView.offsetLeft;
      const wantWidth = evt.clientX - left;
      const minWidth = 100;
      const newWidth = Math.max(minWidth, wantWidth);
      const parentWidth = this.myRef.offsetWidth;
      const newWidthPercent = Math.round(newWidth/parentWidth*100)+"%";
      this.firstView.style.minWidth = newWidthPercent;
      this.firstView.style.width = newWidthPercent;
      this.firstView.style.flexGrow = 0;
      this.secondView.style.width = 'auto';
    } else {
      const top = this.firstView.offsetTop;
      const wantHeight = evt.clientY - top;
      const minHeight = 100;
      const newHeight = Math.max(minHeight, wantHeight);
      const parentHeight = this.myRef.offsetHeight;
      const newHeightPercent = Math.round(newHeight/parentHeight*100)+"%";
      this.firstView.style.minHeight = newHeightPercent;
      this.firstView.style.height = newHeightPercent;
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
          userSelect: this.state.isBarDragging ? 'none' : 'auto',
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