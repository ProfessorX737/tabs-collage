import React from 'react';
import './website-grid.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withResizeDetector } from 'react-resize-detector';
import clsx from 'clsx';
import CloseRounded from "@material-ui/icons/CloseRounded";

let imgRef = null;

class WebsiteGrid extends React.Component {
  constructor(props) {
    super(props);
    this.imgRefs = [];
    this.state = {
      websites: [],
      currSite: null,
      imgRatio: 190 / 362,
      gridRef: null,
      notAll: false
    }
  }

  componentDidMount() {
    this.filterSitesOnImg();
  }

  componentDidUpdate(prevProps) {
    if (this.props.websites !== prevProps.websites) {
      this.filterSitesOnImg();
    }
  }

  filterSitesOnImg = () => {
    const websites = this.props.websites.filter(site => {
      return Boolean(this.props.urlImgs[site.url]);
    })
    let notAll = false;
    if (websites.length < this.props.websites.length) notAll = true;
    this.setState({
      websites,
      notAll
    })
  }

  // calculate number of columns for best fit
  // given img ratio, grid ratio and number of images
  calcColumnCount = () => {
    if (!this.props.width) return 2;
    const gridWidth = this.props.width;
    const gridHeight = this.props.height;
    const numImgs = this.state.websites.length;
    const imgRatio = this.state.imgRatio;
    const gridRatio = gridWidth / gridHeight;
    let cols = Math.sqrt(numImgs * imgRatio * gridRatio);
    cols = Math.round(cols);
    // this formula assumes that rows = numImgs / cols
    // but actually rows = ceil(numImgs/cols). So we want to
    // do a manual check to see if the totalHeight is too large
    const rows = Math.ceil(numImgs / cols);
    const w = gridWidth / cols;
    const h = w * imgRatio;
    this.imHeight = h;
    const totalHeight = rows * h;
    if (totalHeight > gridHeight * 1.5) cols += 1;
    return cols;
  }

  onItemClose = () => {
    console.log('close grid item')
  }

  render() {
    return (
      <div className="grid-wrapper">
        {this.state.notAll &&
          <div className="grid-notice">
            Some images not available, see in list mode
          </div>
        }
        <div
          className="website-grid"
          style={{
            columnCount: this.calcColumnCount()
          }}
        >
          {this.state.websites.map((site, index) => {
            const img = this.props.urlImgs[site.url];
            return (
              <div
                key={site.id}
                className="grid-item"
                ref={el => { this.imgRefs[site.id] = el }}
              >
                <img
                  src={img}
                  className="grid-img"
                />
                <img
                  src={site.favIconUrl}
                  className="grid-item-icon"
                />
                <div className="grid-item-title">
                  {site.title}
                </div>
                <div className="grid-item-label">
                  {site.title}
                </div>
                <div
                  className="grid-item-close-btn"
                  onClick={this.onItemClose}
                >
                  <CloseRounded />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

WebsiteGrid.propTypes = {
  websites: PropTypes.array.isRequired
}

const ResizedWebsiteGrid = withResizeDetector(WebsiteGrid);

export default connect(
  state => ({
    urlImgs: state.view.urlImgs
  }),
  null
)(ResizedWebsiteGrid);
