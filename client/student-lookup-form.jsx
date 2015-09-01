/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var baseUrl = require('../baseurl');
var parseSwipe = require('../parse-swipe');

var StudentLookupForm = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired,
        onStudentLookup: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            swipeData: ''
        };
    },

    componentDidMount: function() {
        this.refs.swipeData.getDOMNode().focus();
    },

    handleSwipeDataChange: function(e) {
        this.setState({swipeData: e.target.value});
    },

    handleSubmit: function(e) {
        e.preventDefault();
        if (!this.state.swipeData) {
            return;
        }

        var id = this.props.courseId;
        var uin = parseSwipe(this.state.swipeData);
        var url = baseUrl + '/api/courses/' + id + '/checkins/' + uin;
        $.get(url, function(result) {
            this.props.onStudentLookup(result);
            this.setState({swipeData: ''});
        }.bind(this));
    },

    render: function() {
        return <div>
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    className="form-control"
                    id="swipeData"
                    ref="swipeData"
                    placeholder="Look up student (Swipe i-card or enter UIN)"
                    value={this.state.swipeData}
                    onChange={this.handleSwipeDataChange} />
            </form>
        </div>;
    }
});

module.exports = StudentLookupForm;
