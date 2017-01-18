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
            message: '',
            errorSwipe: null
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
                message: '',
                errorSwipe: null
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
                message: message,
                errorSwipe: xhr.responseJSON
            });
        }.bind(this));
    },

    render: function() {
        var alert = null;
        if (this.state.message) {
            var sw = null;
            if (this.state.errorSwipe && this.state.errorSwipe.secretWord) {
                sw = <div>
                    <p>Your secret word was:</p>
                    <div className="secret-word">{this.state.errorSwipe.secretWord}</div>
                </div>;
            }
            alert = <div className="alert alert-danger" role="alert">
                <p>{this.state.message}</p>
                {sw}
            </div>;
        }

        var secretWord = null;
        if (!this.state.errorSwipe && this.state.lastSwipes.length > 0 && this.state.lastSwipes[0].secretWord) {
            secretWord = <div className="alert alert-info" role="alert">
                <p>Your secret word is:</p>
                <div className="secret-word">{this.state.lastSwipes[0].secretWord}</div>
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

        var photoUrl = baseUrl + '/no_photo.jpg';
        if (this.state.lastSwipes.length > 0) {
            var id = this.props.sectionId;
            var lastUIN = this.state.lastSwipes[0].uin;
            photoUrl = baseUrl + '/api/sections/' + id + '/students/' + lastUIN + '/photo.jpg';
        }

        return <div>
            <div className="well">
                <div className="row">
                    <div className="col-md-8">
                        <legend className="checkin-form-label">
                            Swipe i-card or enter UIN/NetID
                        </legend>
                        {alert}
                        {secretWord}
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
                        <img className="checkin-id-photo" src={photoUrl} />
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
