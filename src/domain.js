/*global chrome*/
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import assert from 'assert'
import './domain.css'
import WebsiteList from './website-list';
import WebsiteGrid from './website-grid';
import ViewMode from './view-mode';
import { VIEW_MODE } from './constants';
import { getTabSites } from './search-utils';

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

		let websites = getTabSites({
			view: this.props.view, 
			tab: currTab
		});

		const isList = this.props.view.viewMode === VIEW_MODE.list;
		if (isList) { websites.sort(this.siteCompare); }
		this.setState({ websites });
	}

	siteCompare = (a, b) => {
		return a.url < b.url ? -1 : a.url > b.url ? 1 : 0;
	}

	render() {
		const isList = this.props.view.viewMode === VIEW_MODE.list;
		return (
			<div className="domain">
				{isList ?
					<WebsiteList websites={this.state.websites} />
					:
					<WebsiteGrid websites={this.state.websites} />
				}
				<ViewMode
					view={this.props.view}
					viewPath={this.props.viewPath}
				/>
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
		websites: state.view.websites
	}),
	null
)(Domain)