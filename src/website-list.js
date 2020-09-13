import React from 'react';
import './website-list.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import clsx from 'clsx';
import CloseRounded from "@material-ui/icons/CloseRounded";
import * as chrome from './chrome-api';
import * as constants from './constants';

class WebsiteList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currSite: null,
			resized: false,
		}
		this.myrefs = {};
		this.imgRefs = {};
	}

	componentDidMount() {
		window.addEventListener("blur", () => {
			if (this.blurFilter) this.blurFilter.style.display = 'block';
		})
	}

	onFocus = (evt, siteId) => {
		this.setState({ currSite: siteId });
		const currEl = document.activeElement;
		if (currEl.getAttribute('class') === 'site-item') {
			setTimeout(() => {
				const imgEl = this.imgRefs[siteId];
				if (imgEl) {
					this.imgRefs[siteId].scrollIntoView({
						block: "center"
					})
				}

			})
		}
	}

	onKeyDown = (evt, site, index) => {
		const siteEls = [...evt.target.parentNode.children];
		if (evt.key === "ArrowDown") {
			evt.preventDefault();
			if (siteEls[index + 1]) {
				const nextEl = siteEls[index + 1];
				nextEl.focus();
			}
		} else if (evt.key === "ArrowUp") {
			evt.preventDefault();
			if (siteEls[index - 1]) {
				const nextEl = siteEls[index - 1];
				nextEl.focus();
			}
		} else if (evt.key === 'd') {
			// focus next el then delete current
			const inc = index === siteEls.length - 1 ? -1 : 1;
			const nextEl = siteEls[index + inc];
			if (nextEl) nextEl.focus();
			chrome.removeTabs([site.id]);
		} else if (evt.key === 'Enter') {
			chrome.setTabActive(site);
		}
	}

	onWheel = evt => {
		evt.stopPropagation();
		const siteEl = document.activeElement;
		if (siteEl.getAttribute('class') !== 'site-item' ||
			siteEl.parentNode !== this.siteList) {
			if (evt.deltaY > 0) {
				const first = this.siteList.firstChild;
				if (first) first.focus();
			} else {
				const last = this.siteList.lastChild;
				if (last) last.focus();
			}
		} else {
			const siteEls = [...siteEl.parentNode.children];
			const index = siteEls.indexOf(siteEl);
			if (evt.deltaY > 0) {
				if (siteEls[index + 1]) {
					const nextEl = siteEls[index + 1];
					nextEl.focus();
				}
			} else if (evt.deltaY < 0) {
				if (siteEls[index - 1]) {
					const nextEl = siteEls[index - 1];
					nextEl.focus();
				}
			}
		}
	}

	onItemClose = (evt, site) => {
		evt.stopPropagation();
		chrome.removeTabs([site.id]);
	}

	calcImgSize = () => {
		if (this.websiteList) {
			let H = this.websiteList.clientHeight;
			let W = this.websiteList.clientWidth;
			let height = Math.min((H + W) * .3, H - 10);
			height = `${height}px`;
			const width = 'auto';
			return {
				height,
				width
			}
		}
		return {};
	}

	onListBackgroundClick = evt => {
		console.log('list background click')
		evt.preventDefault();
		const site = this.props.chromeTabMap[this.state.currSite];
		chrome.setTabActive(site);
	}

	onWebsiteClick = (evt, site) => {
		evt.stopPropagation();
		chrome.setTabActive(site);
	}

	render() {
		return (
			<>
				<div
					ref={el => { this.websiteList = el }}
					className="website-list"
				>
					<div
						ref={el => { this.imgList = el }}
						className="site-img-list"
					>
						{this.props.websites.map((site, index) => {
							let img = this.props.tabImgs[site.id];
							if (!img) img = constants.PLACEHOLDER_IMAGE;
							return (
								<div
									key={site.id}
									className={clsx("img-item", this.state.currSite === site.id && "img-item-focused")}
									ref={el => { this.imgRefs[site.id] = el }}
								>
									{/* {img ? */}
									<img key={site.id} src={img} style={{ ...this.calcImgSize() }} />
									{/* : */}
									{/* } */}
									<img
										src={site.favIconUrl}
										className="list-img-icon"
									/>
								</div>
							)
						})}
					</div>
					<div
						ref={el => { this.floatSiteList = el }}
						className="float-site-list"
						onWheel={this.onWheel}
						onClick={this.onListBackgroundClick}
					>
						<div
							ref={el => { this.siteList = el }}
							className="site-list"
						>
							{this.props.websites.map((site, index) => {
								return (
									<div
										key={site.id}
										ref={el => { this.myrefs[site.id] = el }}
										siteid={site.id}
										tabIndex={-1}
										className="site-item"
										onFocus={evt => { this.onFocus(evt, site.id) }}
										onKeyDown={evt => { this.onKeyDown(evt, site, index) }}
										onMouseEnter={evt => { evt.target.focus() }}
										onClick={evt => this.onWebsiteClick(evt, site)}
									>
										<div className="close-item-btn"
											onClick={evt => this.onItemClose(evt, site)}
										>
											<CloseRounded fontSize="small" />
										</div>
										{
											site.favIconUrl &&
											<img
												className="list-icon"
												src={site.favIconUrl}
												width={20}
												height={20}
											/>
										}
										{site.title}
									</div>
								)
							})}
						</div>
					</div>
					<div
						ref={el => { this.blurFilter = el }}
						className="blur-filter"
						onClick={evt => {
							evt.stopPropagation();
							if (this.blurFilter) this.blurFilter.style.display = "none";
						}}
					/>
					<ReactResizeDetector
						handleHeight
						handleWidth
						onResize={() => { this.setState({ resized: !this.state.resized }) }}
					/>
				</div>
				<div className="img-placeholder">
					{this.props.chromeTabMap[this.state.currSite]?.url}
				</div>
			</>
		)
	}
}

WebsiteList.propTypes = {
	websites: PropTypes.array.isRequired
}

export default connect(
	state => ({
		tabImgs: state.view.tabImgs,
		chromeTabMap: state.view.chromeTabMap
	}),
	null
)(WebsiteList);