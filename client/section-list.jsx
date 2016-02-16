/** @jsx React.DOM */

var React = require('react');
var classNames = require('classnames');

var baseUrl = require('../baseurl');

var SectionList = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        sections: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        checkins: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    getInitialState: function() {
        return {
            query: ''
        };
    },

    componentDidMount: function() {
        this.refs.searchBar.focus();
    },

    handleQueryChange: function(e) {
        this.setState({query: e.target.value});
    },

    render: function() {
        var sections = this.props.sections.filter(function(section) {
            var sectionName = section.name.toLowerCase();
            var query = this.state.query.toLowerCase();
            return sectionName.indexOf(query) > -1;
        }.bind(this)).map(function(section) {
            var highlight = this.props.checkins.some(function(checkin) {
                return checkin.SectionId == section.id;
            });
            var classes = classNames('list-group-item', {
                'list-group-item-success': highlight
            });
            return <a
                href={baseUrl + '/sections/' + section.id}
                className={classes}
                onClick={this.props.handleNav}
                key={section.id}>
                {section.name}
            </a>;
        }.bind(this));

        return <div>
            <input
                type="text"
                className="form-control section-search-bar"
                ref="searchBar"
                placeholder="Search"
                value={this.state.query}
                onChange={this.handleQueryChange} />
            <ul className="list-group section-list">
                {sections}
            </ul>
        </div>;
    }
});

module.exports = SectionList;
