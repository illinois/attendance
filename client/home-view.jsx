/** @jsx React.DOM */

var React = require('react');

var Header = require('./header.jsx');

/**
 * Home view
 */
var HomeView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired
    },

    render: function() {
        return <div>
            <Header handleNav={this.props.handleNav} />
            Home view
        </div>;
    }
});

module.exports = HomeView;
