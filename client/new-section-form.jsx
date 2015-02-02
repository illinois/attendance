/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var baseUrl = require('../baseurl');

var NewSectionForm = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired,
        onCreateSection: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            expanded: false,
            sectionName: ''
        };
    },

    handleExpand: function() {
        this.setState({expanded: true});
        return false;
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.state.expanded && !prevState.expanded) {
            this.refs.sectionName.getDOMNode().focus();
        }
    },

    handleSectionNameChange: function(e) {
        this.setState({sectionName: e.target.value});
    },

    handleSubmit: function() {
        if (!this.state.sectionName) {
            return false;
        }

        var id = this.props.courseId;
        $.ajax({
            type: 'POST',
            url: baseUrl + '/api/courses/' + id + '/sections',
            data: {name: this.state.sectionName}
        })
        .done(function(result) {
            this.props.onCreateSection(result);
            this.setState({expanded: false, sectionName: ''});
        }.bind(this));
        return false;
    },

    render: function() {
        if (!this.state.expanded) {
            return <div>
                <button
                    className="btn btn-default"
                    onClick={this.handleExpand}>
                    New section
                </button>
            </div>;
        }
        return <div>
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    className="form-control"
                    id="sectionName"
                    ref="sectionName"
                    placeholder="Section name"
                    value={this.state.sectionName}
                    onChange={this.handleSectionNameChange} />
            </form>
        </div>;
    }
});

module.exports = NewSectionForm;
