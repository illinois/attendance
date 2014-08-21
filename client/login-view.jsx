/** @jsx React.DOM */

var React = require('react');

/**
 * Login view
 */
var LoginView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        navigateTo: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            username: '',
            password: '',
            disabled: false
        };
    },

    componentDidMount: function() {
        this.refs.username.getDOMNode().focus();
    },

    handleUsernameChange: function(e) {
        this.setState({username: e.target.value});
    },

    handlePasswordChange: function(e) {
        this.setState({password: e.target.value});
    },

    handleLogin: function() {
        this.setState({disabled: true});
        console.log(this.state.username);
        console.log(this.state.password);
        setTimeout(function() {
            this.props.navigateTo('/');
        }.bind(this), 1000);
        return false;
    },

    render: function() {
        return <div>
            <form onSubmit={this.handleLogin}>
                <label htmlFor="username">NetID</label>
                <input
                    type="text"
                    id="username"
                    ref="username"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                    required />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    required />
                <input
                    type="submit"
                    value="Login"
                    disabled={this.state.disabled} />
            </form>
        </div>;
    }
});

module.exports = LoginView;
