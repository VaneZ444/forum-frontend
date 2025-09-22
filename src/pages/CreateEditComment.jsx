import React, {useState, useEffect} from "react";

const CreateEditComment = ({commentId, topicId, onSaved}) => {
    const [content, setContent] = useState("");

    useEffect(() => {
        if (commentId) {
            fetch(`/api/comments/${commentId}`)
                .then(res => res.json())
                .then(data => setContent(data.content));
        }
    }, [commentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {content, topicId};

        const url = commentId ? `/api/comments/${commentId}` : "/api/comments";
        const method = commentId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(payload),
        });

        if (res.ok && onSaved) onSaved();
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>{commentId ? "Edit" : "Create"} Comment</h2>
            <label>
                Content:
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required/>
            </label>
            <button type="submit">{commentId ? "Update" : "Create"}</button>
        </form>
    );
};

export default CreateEditComment;
