/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');

// Enable React Developer Tools
window.React = React;
window.$ = $;

var HomeView = require('./home-view.jsx');
var LoginView = require('./login-view.jsx');
var CourseView = require('./course-view.jsx');
var SectionView = require('./section-view.jsx');

/**
 * Top-level application component
 *
 * Handles routing.
 */
var App = React.createClass({
    propTypes: {
        initialUser: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            view: null,
            user: this.props.initialUser
        };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState.view !== this.state.view;
    },

    initializeRouter: function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '': 'home',
                'login': 'login',
                'courses/:id': 'course',
                'sections/:id': 'section'
            },
            home: function() {
                self.setState({
                    view: <HomeView
                        handleNav={self.handleNav}
                        navigateTo={self.navigateTo}
                        user={self.state.user} />
                });
            },
            login: function() {
                self.setState({
                    view: <LoginView login={self.login} />
                });
            },
            course: function(id) {
                self.setState({
                    view: <CourseView
                        handleNav={self.handleNav}
                        navigateTo={self.navigateTo}
                        user={self.state.user}
                        id={parseInt(id)} />
                });
            },
            section: function(id) {
                self.setState({
                    view: <SectionView
                        handleNav={self.handleNav}
                        navigateTo={self.navigateTo}
                        user={self.state.user}
                        id={parseInt(id)} />
                });
            }
        });
        this.router = new Router();
        Backbone.history.start({pushState: true});
    },

    componentWillMount: function() {
        this.initializeRouter();

        if (!this.props.initialUser) {
            this.navigateTo('/login');
        }
    },

    login: function(user) {
        this.setState({user: user});
        this.navigateTo('/');
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
