/** @jsx React.DOM */

var React = require('react');

var CourseList = require('./course-list.jsx');
var Header = require('./header.jsx');

/**
 * Home view
 */
var HomeView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        navigateTo: React.PropTypes.func.isRequired,
        user: React.PropTypes.object.isRequired
    },

    render: function() {
        return <div>
            <Header
                handleNav={this.props.handleNav}
                navigateTo={this.props.navigateTo}
                user={this.props.user} />
            <CourseList />
        </div>;
    }
});

module.exports = HomeView;
