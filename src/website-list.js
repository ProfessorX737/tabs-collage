import React from 'react';
import './website-list.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import assert from 'assert'

class WebsiteList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currSite: null
		}
		this.myrefs = {};
		this.imgRefs = {};
	}

	componentDidMount() {
		const first = this.props.websites[0];
		if (first) {
			this.setState({ currSite: first.url });
			this.myrefs[first.url].focus();
			console.log(first)
		}
	}

	componentDidUpdate(prevProps) {
		try {
			assert.notDeepEqual(prevProps, this.props);
			const first = this.props.websites[0];
			if (first) {
				this.setState({ currSite: first.url });
				this.myrefs[first.url].focus();
			}

		} catch (e) { }
	}

	onFocus = (evt, url) => {
		setTimeout(() => {
		// const listEl = this.myrefs[url];
		// if (listEl) {
		// 	listEl.scrollIntoView({
		// 		behavior: "smooth",
		// 		block: "center"
		// 	})
		// }
		const imgEl = this.imgRefs[url];
		if (imgEl) {
			this.imgRefs[url].scrollIntoView({
				behavior: "smooth",
				block: "center"
			})
		}

		})
	}

	onKeyDown = evt => {
		const siteEls = [...evt.target.parentNode.children];
		const index = siteEls.indexOf(evt.target);
		if (evt.key === "ArrowDown") {
			evt.preventDefault();
			if (siteEls[index + 1]) {
				const nextEl = siteEls[index + 1];
				// this.onFocus(nextEl.getAttribute('url'));
				nextEl.focus();
			}
		} else if (evt.key === "ArrowUp") {
			evt.preventDefault();
			if (siteEls[index - 1]) {
				const nextEl = siteEls[index - 1];
				// this.onFocus(nextEl.getAttribute('url'));
				nextEl.focus();
			}
		}
	}

	onWheel = evt => {
		evt.stopPropagation();
		const siteEl = document.activeElement;
		const siteEls = [...siteEl.parentNode.children];
		const index = siteEls.indexOf(siteEl);
		if (evt.deltaY > 0) {
			if (siteEls[index + 1]) {
				const nextEl = siteEls[index + 1];
				// this.onFocus(nextEl.getAttribute('url'));
				nextEl.focus();
			}
		} else if (evt.deltaY < 0) {
			if (siteEls[index - 1]) {
				const nextEl = siteEls[index - 1];
				// this.onFocus(nextEl.getAttribute('url'));
				nextEl.focus();
			}
		}
	}

	render() {
		return (
			<div className="website-list">
				<div className="site-img-list">
					{this.props.websites.map((site, index) => {
						const img = this.props.urlImgs[site.url];
						if (img) return (
							<div
								ref={el => { this.imgRefs[site.url] = el }}
								tabIndex={-1}
								style={{
									width: '80%',
									paddingBottom: '1em'
								}}>
								<img key={site.url} src={img} style={{
									width: '100%',
									height: 'auto',
								}} />
							</div>
						)
					})}
				</div>
				<div
					className="float-site-list"
					// onWheel={this.onWheel}
				>
					<div className="site-list" >
						{this.props.websites.map((site, index) => {
							return (
								<div
									ref={el => { this.myrefs[site.url] = el }}
									url={site.url}
									tabIndex={-1}
									className="site-item"
									onFocus={evt => { this.onFocus(evt, site.url) }}
									onKeyDown={this.onKeyDown}
									onMouseEnter={evt => {evt.target.focus()}}
								>
									{site.favIconUrl &&
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
			</div>
		)
	}
}

WebsiteList.propTypes = {
	websites: PropTypes.array.isRequired
}

export default connect(
	state => ({
		urlImgs: state.view.urlImgs
	}),
	null
)(WebsiteList);