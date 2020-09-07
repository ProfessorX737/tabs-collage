/*global chrome*/
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import assert from 'assert'
import './domain.css'
import WebsiteList from './website-list';

class Domain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			websites: [],
		}
	}

	componentDidMount() {
		this.setWebsites();
	}

	componentDidUpdate(prevProps) {
		try {
			assert.notDeepEqual({
				view: this.props.view,
				domains: this.props.domains
			}, {
				view: prevProps.view,
				domains: prevProps.domains
			})
			this.setWebsites();
		} catch (e) { }
	}

	setWebsites = () => {
		// get filtered websites based on domain
		const currTabId = this.props.view.currTabId;
		const tabs = this.props.view.tabs;
		let currTabIndex = 0;
		for (; currTabIndex < tabs.length; currTabIndex++) {
			if (tabs[currTabIndex].id === currTabId) break;
		}
		const currTab = tabs[currTabIndex];
		if (!currTab) return;

		let websites = [];
		const name = currTab.content;
		if(name === "all" && !currTab.regex) {
			// get all tabs in this view
			let websiteSet = new Set();
			for(let i = 0; i < tabs.length; i++) {
				this.getWebsites(tabs[i]).forEach(site => {
					websiteSet.add(site);
				})
			}
			websites = Array.from(websiteSet);
		} else {
			websites = this.getWebsites(currTab);
		}
		websites.sort(this.siteCompare);
		this.setState({ websites });
	}

	siteCompare = ( a, b) => {
		return a.url < b.url ? -1 : a.url > b.url ? 1 : 0;
	}

	getWebsites = tab => {
		let websites = [];
		if(tab.regex) {
			websites = this.grepTabs(tab.content);
		} else {
			websites = this.props.domains[tab.content] || [];
		}
		return websites;
	}

	grepTabs = regex => {
		const reg = RegExp(regex, 'i');
		const sites = Object.values(this.props.chromeTabMap);
		let websites = [];
		for (let i = 0; i < sites.length; i++) {
			const site = sites[i];
			if (site.title.match(reg) || site.url.match(reg)) {
				websites.push(site);
			}
		}
		return websites;
	}

	render() {
		return (
			<div className="domain">
				<WebsiteList websites={this.state.websites} />
			</div>
		)
	}
}

Domain.propTypes = {
	view: PropTypes.object.isRequired,
	viewPath: PropTypes.array.isRequired
}

export default connect(
	state => ({
		domains: state.view.domains,
		urlImgs: state.view.urlImgs,
		chromeTabMap: state.view.chromeTabMap
	}),
	null
)(Domain)