/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var CheckinForm = require('./checkin-form.jsx');
var CommentSection = require('./comment-section.jsx');

var SectionView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
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
        if (!this.state.section) {
            return <div>Loading...</div>;
        }

        var id = this.props.id;
        return <div>
            <a
                href={'/courses/' + this.state.section.CourseId}
                onClick={this.props.handleNav}>
                &laquo; Back to course
            </a>
            <h1>{this.state.section.name}</h1>
            <CheckinForm sectionId={id} />
            <a
                href={'/api/sections/' + id + '/checkins.csv'}
                className="btn btn-default"
                download>
                Export to CSV
            </a>
            <CommentSection sectionId={id} />
        </div>;
    }
});

module.exports = SectionView;
