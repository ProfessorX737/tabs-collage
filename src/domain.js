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
		const domain = this.props.view.currTabId;
		const tabs = this.props.view.tabs;
		// special case for domain = all
		let urls = [];
		if (domain === 'all') {
			for (let i = 0; i < tabs.length; i++) {
				const tabId = tabs[i].id;
				if (this.props.domains[tabId]) {
					urls.push(...this.props.domains[tabId]);
				}
			}
		} else {
			// get websites with domain = domain
			urls = this.props.domains[domain] || [];
		}
		urls.sort();
		const websites = urls.map(url => {
			return this.props.urlTabMap[url];
		})
		this.setState({ websites });
	}

	render() {
		return (
			<div className="domain">
				<WebsiteList websites={this.state.websites}/>
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
		urlTabMap: state.view.urlTabMap,
		urlImgs: state.view.urlImgs
	}),
	null
)(Domain)