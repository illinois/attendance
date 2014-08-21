/** @jsx React.DOM */

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var React = require('react');

var HomeView = require('./home-view.jsx');
var LoginView = require('./login-view.jsx');

/**
 * Top-level application component
 *
 * Handles routing.
 */
var App = React.createClass({
    getInitialState: function() {
        return {
            view: null,
            authenticated: false
        };
    },

    componentWillMount: function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '': 'home',
                'login': 'login'
            },
            home: function() {
                self.setState({
                    view: <HomeView handleNav={self.handleNav} />
                });
            },
            login: function() {
                self.setState({
                    view: <LoginView
                        handleNav={self.handleNav}
                        navigateTo={self.navigateTo}
                        login={self.login} />
                });
            }
        });
        this.router = new Router();
        Backbone.history.start({pushState: true});
        this.getSession();
    },

    login: function() {
        this.setState({authenticated: true});
        this.navigateTo('/');
    },

    getSession: function() {
        $.get('/api/session', function() {
            console.log('success');
            this.setState({authenticated: true});
        }.bind(this))
        .fail(function() {
            console.log('false');
            this.setState({authenticated: false});
        }.bind(this));
    },

    // onClick handler for <a> tags
    handleNav: function(e) {
        this.navigateTo(e.currentTarget.pathname);
        return false;
    },

    navigateTo: function(path) {
        this.router.navigate(path, {trigger: true});
    },

    render: function() {
        return <div>
            {this.state.view}
        </div>;
    }
});

module.exports = App;
