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
import Close from "@material-ui/icons/Close";
import './tab.css';
import TextField from '@material-ui/core/TextField';

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

	onCloseTab = evt => {
		evt.stopPropagation();
		// we don't want to remove domain tabs
		if (!this.props.tab.regex) return;
		const tabId = this.props.tab.id;
		this.props.closeTab({
			view: this.props.view,
			viewPath: this.props.viewPath,
			tabId,
			tabIndex: this.props.tabIndex
		})
	}

	onTabDoubleClick = evt => {
		evt.stopPropagation();
		// don't allow editing of domain tabs
		if(!this.props.tab.regex) return;
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
					minWidth: isEditing ? '150px' : '55px'
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
							className="tab-input"
							onKeyDown={this.onTabInputKeyDown}
						>
							<TextField
								autoFocus
								value={this.props.tab.content}
								onChange={this.onTabInputChange}
								style={{
									width: `${tab.content.length}ch`,
									minWidth: '100%'
								}}
							/>
						</div>
						:
						<div className="tab-content">
							{tab.icon &&
								<img src={tab.icon} width="25" height="25" style={{ marginRight: '5px' }} />
							}
							{tab.content}
						</div>
					}
				</div>
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