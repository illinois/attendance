/** @jsx React.DOM */

var React = require('react');

/**
 * Page header
 */
var Header = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired
    },

    render: function() {
        return <div>
            <ul>
                <li>
                    <a href="/" onClick={this.props.handleNav}>Home</a>
                </li>
                <li>
                    <a href="/login" onClick={this.props.handleNav}>Login</a>
                </li>
            </ul>
        </div>;
    }
});

module.exports = Header;
