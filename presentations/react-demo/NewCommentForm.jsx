
const onChange = (replyToId, event) => commentStore.editReplyToText(replyToId, event.currentTarget.value);

window.NewCommentForm = ({value,replyToId}) => {
	return (
		<div>
			<textarea placeholder="Join the discussion" 
					  value={value}
					  onChange={onChange.bind(undefined,replyToId)}></textarea>
			<button onClick={commentStore.addReply.bind(undefined,replyToId,value)}>Save</button>
		</div>
	)
}