import React, { useState } from 'react';
import './search-bar.css';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Search,
  CloseRounded
} from '@material-ui/icons';

export default function SearchBar(props) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={
        clsx("search-bar",
          focused ? "search-bar-focused" : "search-bar-hightlight")
      }
      onClick={() => { if(!focused) setFocused(true) }}
      onBlur={() => { if(focused) setFocused(false) }}
    >
      <Search
        fontSize="small"
        className={clsx("search-bar-icon", focused && "search-bar-white")}
      />
      <div className={
        clsx("search-bar-content",
          (props.search || focused) && "search-bar-content-expanded")
      }>
        <input
          ref={el => { if (el) el.focus() }}
          className="search-bar-input"
          type="text"
          value={props.search}
          onChange={evt => { props.onSearchChange(evt.target.value) }}
          placeholder="search/regex"
        />
        <CloseRounded
          fontSize="small"
          className="search-bar-close"
          onClick={() => { props.onSearchChange('') }}
        />
      </div>
    </div>
  )
}

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired
}