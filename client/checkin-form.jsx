/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var moment = require('moment');

/**
 * Renders card swipe checkin form and last 5 swipes
 */
var CheckinForm = React.createClass({
    propTypes: {
        sectionId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            swipeData: '',
            lastSwipes: [],
            message: ''
        };
    },

    componentDidMount: function() {
        this.refs.swipeData.getDOMNode().focus();

        // Populate "Last swipes" section
        var url = (
            '/api/sections/' + this.props.sectionId + '/checkins?last=1'
        );
        $.get(url, function(data) {
            this.setState({lastSwipes: data.checkins});
        }.bind(this));

        // Update relative time labels
        this.interval = setInterval(this.forceUpdate.bind(this), 1000);
    },

    componentWillUnmount: function() {
        clearInterval(this.interval);
    },

    handleSwipeDataChange: function(e) {
        this.setState({swipeData: e.target.value});
    },

    handleSubmit: function() {
        if (!this.state.swipeData) {
            return false;
        }

        $.ajax({
            type: 'POST',
            url: '/api/sections/' + this.props.sectionId + '/checkins',
            data: {swipeData: this.state.swipeData}
        })
        .done(function(result) {
            var newLastSwipes = React.addons.update(
                this.state.lastSwipes,
                {$unshift: [result]}
            ).slice(0, 5);
            this.setState({
                swipeData: '',
                lastSwipes: newLastSwipes,
                message: ''
            });
        }.bind(this))
        .fail(function(xhr) {
            var message;
            if (xhr.status === 409) {
                var checkin = xhr.responseJSON;
                var timeAgo = moment(checkin.createdAt).fromNow();
                message = 'Already checked in ' + timeAgo;
            } else {
                message = 'Invalid swipe';
            }
            this.setState({
                swipeData: '',
                message: message
            });
        }.bind(this));
        return false;
    },

    render: function() {
        var lastSwipes = this.state.lastSwipes.map(function(swipe) {
            return <div key={swipe.id}>
                {swipe.uin} - {moment(swipe.createdAt).fromNow()}
            </div>;
        });
        return <div>
            <div>Swipe i-card or enter UIN</div>
            <div style={{color: 'red'}}>{this.state.message}</div>
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    id="swipeData"
                    ref="swipeData"
                    value={this.state.swipeData}
                    onChange={this.handleSwipeDataChange} />
            </form>
            <h2>Last swipes</h2>
            {lastSwipes}
        </div>;
    }
});

module.exports = CheckinForm;
