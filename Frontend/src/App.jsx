import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { signInWithGoogle, logOut, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [search, activeCategory]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`, {
        params: { search, category: activeCategory }
      });
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoogleLogin = async () => {
    const loggedInUser = await signInWithGoogle();
    if (loggedInUser) {
      alert(`Welcome ${loggedInUser.displayName}! 🎉`);
    }
  };

  const handleLogout = async () => {
    await logOut();
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please fill title and content!");
      return;
    }
    if (editingId) {
      await axios.put(`${API}/api/posts/${editingId}`, {
        title,
        content,
        author: user?.displayName || author,
        category
      });
      setEditingId(null);
      alert("Post updated! ✅");
    } else {
      await axios.post(`${API}/api/posts`, {
        title,
        content,
        author: user?.displayName || author,
        category
      });
    }
    setTitle("");
    setContent("");
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
      await axios.delete(`${API}/api/posts/${id}`);
      fetchPosts();
    }
  };

  const formatText = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
        <h2 style={{ color: "white", fontSize: "24px" }}>Loading Blogify... ⏳</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">✍️</div>
          <h1 className="login-title">Blogify</h1>
          <p className="login-subtitle">Write. Publish. Inspire.</p>
          <p className="login-desc">
            Your personal blogging platform. Create beautiful posts and share your thoughts with the world!
          </p>
          <button onClick={handleGoogleLogin} className="google-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: "24px", marginRight: "10px" }}
            />
            Continue with Google
          </button>
          <p className="login-footer">
            Free forever. No credit card required. 🎉
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1>✍️ Blogify</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src={user.photoURL}
            alt={user.displayName}
            style={{ width: "35px", height: "35px", borderRadius: "50%", border: "2px solid white" }}
          />
          <span style={{ fontSize: "14px" }}>
            {user.displayName}
          </span>
          <button
            onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "8px 15px", border: "1px solid white", borderRadius: "5px", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
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
                  <button
                    onClick={() => handleEdit(post)}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
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