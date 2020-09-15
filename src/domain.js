import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import assert from 'assert'
import './domain.css'
import WebsiteList from './website-list';
import WebsiteGrid from './website-grid';
import ViewMode from './view-mode';
import { VIEW_MODE } from './constants';
import { getTabSites, grepSites } from './search-utils';
import SearchBar from './search-bar';
import { changeTab } from './redux/actions';

class Domain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			websites: [],
			search: ''
		}
	}

	componentDidMount() {
		this.setWebsites();
	}

	componentDidUpdate(prevProps, prevState) {
		try {
			assert.notDeepStrictEqual({
				view: this.props.view,
				domains: this.props.domains,
				search: this.state.search
			}, {
				view: prevProps.view,
				domains: prevProps.domains,
				search: prevState.search
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
		if (!currTab) {
			// likely this tab was closed externally so set currTab
			// to be the first one
			const firstTabId = tabs[0]?.id || 0;
			this.props.changeTab({
				viewPath: this.props.viewPath,
				tabId: firstTabId
			});
			return;
		}

		let websites = getTabSites({
			view: this.props.view,
			tab: currTab
		});

		// filter again based on search if search string is non empty
		if(this.state.search) {
			websites = grepSites(websites, this.state.search);
		}

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
				<SearchBar
					search={this.state.search}
					onSearchChange={search => this.setState({ search })}
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
	{ changeTab }
)(Domain)