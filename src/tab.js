import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
	changeTab,
	closeTab,
	setTabEdit,
	setTabContent
} from "./redux/actions"
import clsx from 'clsx';
import {
	Close,
	HighlightOff
} from "@material-ui/icons";
import './tab.css';
import * as chrome from './chrome-api';
import { getTabSites } from './search-utils';

class Tab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditing: false
		}
	}

	onTabClick = evt => {
		const tabId = this.props.tab.id;
		if (this.props.view.currTabId !== tabId) {
			this.props.changeTab({
				viewPath: this.props.viewPath,
				tabId
			})
		}
		this.tabRef.scrollIntoView();
	}

	// close all sites under this tab
	onCloseAll = evt => {
		evt.stopPropagation();
		// don't close the all tab but still close all sites
		if (this.props.tab.content !== "all") {
			this.props.closeTab({
				view: this.props.view,
				viewPath: this.props.viewPath,
				tabId: this.props.tab.id,
				tabIndex: this.props.tabIndex
			})
		}
		const tabIds = getTabSites({
			view: this.props.view,
			tab: this.props.tab
		}).map(site => site.id);
		chrome.removeTabs(tabIds);
	}

	onCloseTab = evt => {
		evt.stopPropagation();
		// we don't want to remove domain tabs
		if (!this.props.tab.regex) return;
		this.props.closeTab({
			view: this.props.view,
			viewPath: this.props.viewPath,
			tabId: this.props.tab.id,
			tabIndex: this.props.tabIndex
		})
	}

	onTabDoubleClick = evt => {
		evt.stopPropagation();
		// don't allow editing of domain tabs
		if (!this.props.tab.regex) return;
		this.props.setTabEdit({
			viewPath: this.props.viewPath,
			isEditing: !this.props.tab.isEditing,
			tabIndex: this.props.tabIndex
		})
	}

	onTabInputChange = evt => {
		this.props.setTabContent({
			viewPath: this.props.viewPath,
			content: evt.target.value,
			tabIndex: this.props.tabIndex
		})
	}

	onTabInputKeyDown = evt => {
		if (evt.key === "Enter") {
			this.props.setTabEdit({
				viewPath: this.props.viewPath,
				isEditing: false,
				tabIndex: this.props.tabIndex
			})
		}
	}

	render() {
		const tab = this.props.tab;
		const isEditing = tab.isEditing;
		const isCurrTab = tab.id === this.props.view.currTabId;
		const showOptions = isCurrTab || this.props.tabWidth > 100
		return (
			<div
				ref={el => { this.tabRef = el }}
				id={tab.id}
				className={clsx(
					tab.id === this.props.view.currTabId
						? "sel-article-tab"
						: "article-tab"
				)}
				onClick={this.onTabClick}
				onDoubleClick={this.onTabDoubleClick}
				style={{
					width: isEditing ? 'fit-content' : `${this.props.tabWidth}px`,
					maxWidth: isEditing ? '100%' : '150px',
					minWidth: isEditing ? '150px' : isCurrTab ? '55px' : '35px'
				}}
			>
				<div
					className={clsx("tab-content-wrapper",
						tab.id === this.props.view.currTabId
							? "text-fade-white"
							: "text-fade-transparent"
					)}
				>
					{isEditing ?
						<div
							className="tab-input-wrapper"
							onKeyDown={this.onTabInputKeyDown}
						>
							<input
								autoFocus
								className='tab-input'
								type="text"
								value={this.props.tab.content}
								placeholder="search/regex"
								onChange={this.onTabInputChange}
								style={{
									width: `${tab.content.length}ch`
								}}
							/>
						</div>
						:
						<div className="tab-content">
							{tab.icon &&
								<img src={tab.icon} width="25" height="auto" style={{ marginRight: '5px' }} />
							}
							{tab.content}
						</div>
					}
				</div>
				{showOptions &&
					<div className="tab-options">
						<div
							className="close-all-tab-btn"
							onClick={this.onCloseAll}
						>
							<HighlightOff
								style={{
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
						</div>
						{tab.regex &&
							<div
								className="close-tab-btn"
								onClick={this.onCloseTab}
							>
								<Close
									style={{
										fontSize: "15px",
										borderRadius: "10px"
									}}
								/>
							</div>
						}
					</div>
				}
				<div className="tab-separator" />
			</div>
		)
	}
}

Tab.propTypes = {
	tab: PropTypes.object.isRequired,
	tabIndex: PropTypes.number.isRequired,
	view: PropTypes.object.isRequired,
	viewPath: PropTypes.array.isRequired,
	tabWidth: PropTypes.number
}

export default connect(
	null,
	{
		changeTab,
		closeTab,
		setTabEdit,
		setTabContent
	}
)(Tab);