import React, {useState, useEffect} from "react";

const CreateEditCategory = ({categoryId, onSaved}) => {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        if (categoryId) {
            // fetch существующей категории
            fetch(`/api/categories/${categoryId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title);
                    setSlug(data.slug);
                });
        }
    }, [categoryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {title, slug};

        const url = categoryId ? `/api/categories/${categoryId}` : "/api/categories";
        const method = categoryId ? "PUT" : "POST";

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
            <h2>{categoryId ? "Edit" : "Create"} Category</h2>
            <label>
                Title:
                <input value={title} onChange={(e) => setTitle(e.target.value)} required/>
            </label>
            <label>
                Slug:
                <input value={slug} onChange={(e) => setSlug(e.target.value)} required/>
            </label>
            <button type="submit">{categoryId ? "Update" : "Create"}</button>
        </form>
    );
};

export default CreateEditCategory;
