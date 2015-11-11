const comments = [
	{ commentId: 1, message: 'First!' },
	{ commentId: 2, message: 'FIRST!!!!' },
	{ commentId: 3, message: 'How about no, lol!', inReplyTo: 2}
]

const replyingTo = {}

const nestedComments = function(){
	return comments.filter(comment => !comment.inReplyTo)
			.map(function nest(comment) {
				return {
						...comment,
						showReplyTo: replyingTo[comment.commentId],
						subComments: comments.filter(subComment => subComment.inReplyTo === comment.commentId)
								.map(nest)
			}
					});
}

window.setReplyTo = (commentId,active) => {
	if(active)
		replyingTo[commentId] = true;
	else
		delete replyingTo[commentId];
	render();
}

const render = () => {
	ReactDOM.render(<App comments={nestedComments()} />, document.getElementById('mount'));
}

class App extends React.Component {
	render() {
		return (
			<div style={{background: '#F44336',fontFamily: 'sans-serif', paddingRight: '1em'}}>
				<NewCommentForm />
				<CommentsList comments={this.props.comments} />
			</div>
		)
	}
}

render();