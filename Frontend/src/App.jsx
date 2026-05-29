import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const CATEGORIES = [
  "General",
  "Technology",
  "Life",
  "Travel",
  "Food",
  "Education",
  "News"
];

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("General");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const editorRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, [search, activeCategory]);

  const fetchPosts = async () => {
    const res = await axios.get("http://localhost:5000/api/posts", {
      params: {
        search: search,
        category: activeCategory
      }
    });
    setPosts(res.data);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please fill title and content!");
      return;
    }
    if (editingId) {
      await axios.put(`http://localhost:5000/api/posts/${editingId}`, {
        title, content, author, category
      });
      setEditingId(null);
      alert("Post updated! ✅");
    } else {
      await axios.post("http://localhost:5000/api/posts", {
        title, content, author, category
      });
    }
    setTitle("");
    setContent("");
    setAuthor("");
    setCategory("General");
    if (editorRef.current) editorRef.current.innerHTML = "";
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    setCategory(post.category || "General");
    if (editorRef.current) editorRef.current.innerHTML = post.content;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setAuthor("");
    setCategory("General");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this post?")) {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      fetchPosts();
    }
  };

  const formatText = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1>📝 Blogify</h1>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>
          Write. Publish. Inspire. 🚀
        </span>
      </div>

      <div className="container">

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search posts by title, content or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            onClick={() => setActiveCategory("All")}
            className={`cat-btn ${activeCategory === "All" ? "active" : ""}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Create/Edit Post */}
        <div className="create-post">
          <h2>{editingId ? "✏️ Edit Post" : "✍️ Create New Post"}</h2>

          <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

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
            ref={editorRef}
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} className="publish-btn">
              {editingId ? "✅ Update Post" : "🚀 Publish Post"}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                style={{ background: "gray", color: "white", padding: "12px 30px", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", flex: 1 }}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="posts-section">
          <h2>📚 All Blog Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <div className="no-posts">
              <p style={{ fontSize: "40px" }}>📭</p>
              <p>No posts found!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>{post.title}</h3>
                  <span className="category-badge">{post.category}</span>
                </div>
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="post-meta">
                  ✍️ {post.author} &nbsp;|&nbsp; 📅 {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleEdit(post)} className="edit-btn">✏️ Edit</button>
                  <button onClick={() => handleDelete(post._id)} className="delete-btn">🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;