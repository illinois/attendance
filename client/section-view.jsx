/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var Header = require('./header.jsx');
var CheckinForm = require('./checkin-form.jsx');
var CommentSection = require('./comment-section.jsx');

var SectionView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        navigateTo: React.PropTypes.func.isRequired,
        user: React.PropTypes.object.isRequired,
        id: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            section: null
        };
    },

    componentDidMount: function() {
        $.get('/api/sections/' + this.props.id, function(data) {
            this.setState({section: data});
        }.bind(this));
    },

    render: function() {
        var body;
        if (!this.state.section) {
            body = <div>Loading...</div>;
        } else {
            body = <div>
                <a
                    href={'/courses/' + this.state.section.CourseId}
                    onClick={this.props.handleNav}>
                    &laquo; Back to course
                </a>
                <h1>{this.state.section.name}</h1>
                <CheckinForm sectionId={this.props.id} />
                <a
                    href={'/api/sections/' + this.props.id + '/checkins.csv'}
                    download>
                    Export to CSV
                </a>
                <CommentSection sectionId={this.props.id} />
            </div>;
        }

        return <div>
            <Header
                handleNav={this.props.handleNav}
                navigateTo={this.props.navigateTo}
                user={this.props.user} />
            {body}
        </div>;
    }
});

module.exports = SectionView;
