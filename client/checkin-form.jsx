/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var moment = require('moment');

var baseUrl = require('../baseurl');

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
        var id  = this.props.sectionId;
        var url = baseUrl + '/api/sections/' + id + '/checkins?last=1';
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

    handleSubmit: function(e) {
        e.preventDefault();
        if (!this.state.swipeData) {
            return;
        }

        var id = this.props.sectionId;
        $.ajax({
            type: 'POST',
            url: baseUrl + '/api/sections/' + id + '/checkins',
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
    },

    render: function() {
        var alert = null;
        if (this.state.message) {
            alert = <div className="alert alert-danger" role="alert">
                {this.state.message}
            </div>;
        }

        var lastSwipes = this.state.lastSwipes.map(function(swipe) {
            return <li className="list-group-item" key={swipe.id}>
                {swipe.uin}
                <span style={{color: '#aaa', float: 'right'}}>
                    {moment(swipe.createdAt).fromNow()}
                </span>
            </li>;
        });

        return <div className="row">
            <div className="col-md-4">
                {alert}
                <p>Swipe i-card or enter UIN</p>
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        className="form-control input-lg"
                        id="swipeData"
                        ref="swipeData"
                        value={this.state.swipeData}
                        onChange={this.handleSwipeDataChange} />
                </form>
                <h2>Last swipes</h2>
                <ul className="list-group">
                    {lastSwipes}
                </ul>
            </div>
        </div>;
    }
});

module.exports = CheckinForm;
