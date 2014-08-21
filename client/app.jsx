/** @jsx React.DOM */

var Backbone = require('backbone');
Backbone.$ = require('jquery');
var React = require('react');

var Header = require('./header.jsx');
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
            view: null
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
                    view: <LoginView handleNav={self.handleNav} />
                });
            }
        });
        this.router = new Router();
        Backbone.history.start({pushState: true});
    },

    handleNav: function(e) {
        this.router.navigate(e.currentTarget.pathname, {trigger: true});
        return false;
    },

    render: function() {
        return <div>
            <Header handleNav={this.handleNav} />
            {this.state.view}
        </div>;
    }
});

module.exports = App;
