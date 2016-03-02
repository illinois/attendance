/** @jsx React.DOM */

var React = require('react');
var update = require('react-addons-update');
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
        this.refs.swipeData.focus();

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
            var newLastSwipes = update(
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
                message = 'Invalid swipe/UIN or unknown NetID';
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
            var text;
            if (swipe.netid) {
                text = swipe.fullName + ' (' + swipe.netid + ')';
            } else {
                text = swipe.uin;
            }
            return <li className="list-group-item" key={swipe.id}>
                {text}
                <span className="swipe-timestamp">
                    {moment(swipe.createdAt).fromNow()}
                </span>
            </li>;
        });

        var idPhoto = null;
        if (this.state.lastSwipes[0] !== undefined) {
            var id = this.props.sectionId;
            var lastUIN = this.state.lastSwipes[0].uin;
            var photoUrl = baseUrl + '/api/sections/' + id + '/students/' + lastUIN + '/photo.jpg';
            idPhoto = <img className="checkin-id-photo" src={photoUrl} />;
        }

        return <div>
            <div className="well">
                <div className="row">
                    <div className="col-md-8">
                        <legend className="checkin-form-label">
                            Swipe i-card or enter UIN/NetID
                        </legend>
                        {alert}
                        <form
                            onSubmit={this.handleSubmit}
                            autoComplete="off">
                            <input
                                type="text"
                                className="form-control input-lg"
                                id="swipeData"
                                ref="swipeData"
                                value={this.state.swipeData}
                                onChange={this.handleSwipeDataChange} />
                        </form>
                    </div>
                    <div className="col-md-4 checkin-id-photo-container">
                        {idPhoto}
                    </div>
                </div>
            </div>
            <h2>Last swipes</h2>
            <ul className="list-group">
                {lastSwipes}
            </ul>
        </div>;
    }
});

module.exports = CheckinForm;
