/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var moment = require('moment');

/**
 * Comments and comment form for given section
 */
var CommentSection = React.createClass({
    propTypes: {
        sectionId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            loading: true,
            comments: [],
            commentText: '',
            disabled: false
        };
    },

    componentDidMount: function() {
        var url = '/api/sections/' + this.props.sectionId + '/comments';
        $.get(url, function(data) {
            this.setState({
                loading: false,
                comments: data.comments
            });
        }.bind(this));
    },

    handleCommentTextChange: function(e) {
        this.setState({commentText: e.target.value});
    },

    handleSubmit: function() {
        if (!this.state.commentText) {
            return false;
        }
        this.setState({disabled: true});

        $.ajax({
            type: 'POST',
            url: '/api/sections/' + this.props.sectionId + '/comments',
            data: {text: this.state.commentText}
        })
        .done(function(result) {
            console.log(result);
            var newComments = React.addons.update(
                this.state.comments,
                {$push: [result]}
            );
            this.setState({
                commentText: '',
                comments: newComments,
                disabled: false
            });
        }.bind(this));

        return false;
    },

    render: function() {
        var body;
        if (this.state.loading) {
            body = <div>Loading...</div>;
        } else {
            var comments = this.state.comments.map(function(comment) {
                var time = moment(comment.createdAt).calendar();
                return <div key={comment.id} style={{paddingBottom: "10px"}}>
                    <div>{comment.user.name} ({comment.user.netid})</div>
                    <div>{time}</div>
                    <div>{comment.text}</div>
                </div>;
            });

            body = <div>
                {comments}
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <textarea
                            value={this.state.commentText}
                            onChange={this.handleCommentTextChange}
                            required />
                    </div>
                    <div>
                        <input
                            type="submit"
                            value="Post"
                            disabled={this.state.disabled} />
                    </div>
                </form>
            </div>;
        }

        return <div>
            <h2>Comments</h2>
            {body}
        </div>;
    }
});

module.exports = CommentSection;
