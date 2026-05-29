import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await axios.get("http://localhost:5000/api/posts");
    setPosts(res.data);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please fill title and content!");
      return;
    }
    await axios.post("http://localhost:5000/api/posts", {
      title,
      content,
      author
    });
    setTitle("");
    setContent("");
    document.getElementById("editor").innerHTML = "";
    setAuthor("");
    fetchPosts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/posts/${id}`);
    fetchPosts();
  };

  const formatText = (command, value = null) => {
    const editor = document.getElementById("editor");
    editor.focus();
    document.execCommand(command, false, value);
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1>📝 My CMS Blog</h1>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>
          Content Management System
        </span>
      </div>

      <div className="container">
        {/* Create Post */}
        <div className="create-post">
          <h2>✍️ Create New Post</h2>

          <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />

          <div className="toolbar">
            <button onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }}><b>B</b></button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }}><i>I</i></button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }}><u>U</u></button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("insertUnorderedList"); }}>• List</button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("insertOrderedList"); }}>1. List</button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("formatBlock", "h2"); }}>H2</button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText("formatBlock", "p"); }}>P</button>
          </div>

          <div
            id="editor"
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="editor"
            suppressContentEditableWarning={true}
          />

          <input
            type="text"
            placeholder="Author name..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="input-field"
          />

          <button onClick={handleSubmit} className="publish-btn">
            🚀 Publish Post
          </button>
        </div>

        {/* Posts */}
        <div className="posts-section">
          <h2>📚 All Blog Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <div className="no-posts">
              <p style={{ fontSize: "40px" }}>📭</p>
              <p>No posts yet! Create your first post above!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <h3>{post.title}</h3>
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="post-meta">
                  ✍️ {post.author} &nbsp;|&nbsp; 📅 {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;