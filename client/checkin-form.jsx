/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var CheckinForm = React.createClass({
    propTypes: {
        sectionId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            swipeData: '',
            lastUin: '',
            message: ''
        };
    },

    componentDidMount: function() {
        this.refs.swipeData.getDOMNode().focus();
    },

    handleSwipeDataChange: function(e) {
        this.setState({swipeData: e.target.value});
    },

    handleSubmit: function() {
        var request = $.ajax({
            type: 'POST',
            url: '/api/sections/' + this.props.sectionId + '/checkins',
            data: {swipeData: this.state.swipeData}
        });
        request.done(function(result) {
            this.setState({
                swipeData: '',
                lastUin: result.uin,
                message: ''
            });
        }.bind(this));
        request.fail(function() {
            this.setState({
                swipeData: '',
                message: 'Swipe error'
            });
        }.bind(this));
        return false;
    },

    render: function() {
        return <div>
            {this.state.message}
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    id="swipeData"
                    ref="swipeData"
                    value={this.state.swipeData}
                    onChange={this.handleSwipeDataChange}
                    required />
            </form>
            Last checkin: {this.state.lastUin}
        </div>;
    }
});

module.exports = CheckinForm;
