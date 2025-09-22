import React, {useState, useEffect} from "react";
import api, {GATEWAY_BASE} from "../api/api.js";

const CreateEditTopic = ({topicId, onSaved}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (topicId) {
            fetch(`/api/forum/topics/${topicId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title);
                    setContent(data.content);
                });
        }
    }, [topicId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {title, content};

        const url = topicId ? api.GATEWAY_BASE + `/api/forum/topics/${topicId}` : api.GATEWAY_BASE + "/api/forum/topics";
        const method = topicId ? "PUT" : "POST";

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
            <h2>{topicId ? "Edit" : "Create"} Topic</h2>
            <label>
                Title:
                <input value={title} onChange={(e) => setTitle(e.target.value)} required/>
            </label>
            <label>
                Content:
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required/>
            </label>
            <button type="submit">{topicId ? "Update" : "Create"}</button>
        </form>
    );
};

export default CreateEditTopic;
