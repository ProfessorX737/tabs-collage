import React from 'react';
import './website-grid.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withResizeDetector } from 'react-resize-detector';
import { CloseRounded, VolumeUp } from "@material-ui/icons";
import * as chrome from './chrome-api';
import * as constants from './constants';
import clsx from 'clsx';
import assert from 'assert';

class WebsiteGrid extends React.Component {
  constructor(props) {
    super(props);
    this.imgRefs = [];
    this.state = {
      imgRatio: 190 / 362,
    }
  }

  componentDidUpdate(prevProps) {
    try {
      assert.notDeepStrictEqual(prevProps.websites, this.props.websites);
      this.averageImgRatios();
    } catch (e) { }
  }

  // load all images by themselves to find the height/width ratio
  // works around the synchronous behaviour of image loading
  averageImgRatios = () => {
    let numLoading = this.props.websites.length;
    let imgRatios = [];
    const onload = (img) => {
      imgRatios.push(img.height / img.width);
      --numLoading === 0 && this.onAllImagesLoaded(imgRatios);
    }
    for (let i = 0; i < this.props.websites.length; i++) {
      const siteId = this.props.websites[i].id;
      const src = this.props.tabImgs[siteId] || constants.PLACEHOLDER_IMAGE;
      const img = new Image();
      img.src = src;
      img.onload = () => { onload(img) };
    }
  }

  onAllImagesLoaded = imgRatios => {
    let imgRatioSum = 0;
    for (let i = 0; i < imgRatios.length; i++) {
      imgRatioSum += imgRatios[i];
    }
    const avgImgRatio = imgRatioSum / imgRatios.length;
    this.setState({ imgRatio: avgImgRatio });
  }

  // calculate number of columns for best fit
  // given img ratio, grid ratio and number of images
  calcColumnCount = () => {
    if (!this.props.width) return 2;
    const gridWidth = this.props.width;
    const gridHeight = this.props.height;
    const numImgs = this.props.websites.length;
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
    if (totalHeight > gridHeight * 1.2) cols += 1;
    return cols;
  }

  closeSite = (evt, siteId) => {
    evt.stopPropagation();
    chrome.removeTabs([siteId]);
  }

  openSite = (evt, site) => {
    evt.stopPropagation();
    chrome.setTabActive(site)
  }

  render() {
    return (
      <div className="grid-wrapper">
        <div
          className="website-grid"
          style={{
            columnCount: this.calcColumnCount()
          }}
        >
          {this.props.websites.map((site, index) => {
            let img = this.props.tabImgs[site.id];
            if (!img) img = constants.PLACEHOLDER_IMAGE;
            return (
              <div
                key={site.id}
                className={clsx("grid-item", this.props.websites.length === 1 && "grid-single-img")}
                ref={el => { this.imgRefs[site.id] = el }}
                onClick={evt => { this.openSite(evt, site); }}
              >
                <img
                  src={img}
                  alt={site.title}
                  className="grid-img"
                />
                <img
                  src={site.favIconUrl}
                  alt=''
                  className="grid-item-icon"
                />
                <div className="grid-item-title">
                  {site.title}<br />{site.url}
                </div>
                <div className="grid-item-label">
                  {site.title}
                </div>
                <div
                  className="grid-item-close-btn"
                  onClick={evt => { this.closeSite(evt, site.id) }}
                >
                  <CloseRounded />
                </div>
                {site.audible &&
                  <div className="grid-audible-icon">
                    <VolumeUp />
                  </div>
                }
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
    tabImgs: state.view.tabImgs
  }),
  null
)(ResizedWebsiteGrid);
