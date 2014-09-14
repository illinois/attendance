/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var baseUrl = require('../baseurl');
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

    loadSection: function(id) {
        $.get(baseUrl + '/api/sections/' + id, function(data) {
            this.setState({section: data});
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadSection(this.props.id);
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({section: null});
            this.loadSection(nextProps.id);
        }
    },

    render: function() {
        if (!this.state.section) {
            return <div>Loading...</div>;
        }

        var id = this.props.id;
        return <div>
            <a
                href={baseUrl + '/courses/' + this.state.section.CourseId}
                onClick={this.props.handleNav}>
                &laquo; Back to course
            </a>
            <h1>{this.state.section.name}</h1>
            <CheckinForm sectionId={id} />
            <a
                href={baseUrl + '/api/sections/' + id + '/checkins.csv'}
                className="btn btn-default"
                download>
                Export to CSV
            </a>
            <CommentSection sectionId={id} />
        </div>;
    }
});

module.exports = SectionView;
