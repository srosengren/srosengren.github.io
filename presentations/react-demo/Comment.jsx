window.Comment = (props) => {
	return (
		<div style={{paddingLeft: '1em',paddingBottom: '1em'}}>
			<div style={{background: 'white',padding: '1em'}}>
				<pre style={{fontFamily: 'sans-serif'}}>
					{props.message}
				</pre>
			</div>
			{props.replyingTo ? 
			<div>
				<NewCommentForm replyToId={props.commentId} value={props.replyingTo.message} />
			</div> : undefined
			}
			<div>
				<button type="button" onClick={commentStore.setReplyTo.bind(null,props.commentId,!props.replyingTo)}>
					{props.replyingTo ? 'cancel' : 'reply'}
				</button>
			</div>
			{props.subComments.length ? 
				<div style={{paddingTop: '1em'}}>
					<CommentsList comments={props.subComments} />
				</div> : undefined 
			}
		</div>
	)
}