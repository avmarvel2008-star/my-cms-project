import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { signInWithGoogle, logOut, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import PageBuilder from "./PageBuilder";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "General", "Technology", "Life",
  "Travel", "Food", "Education", "News"
];

// Reading time calculator
const calculateReadingTime = (content) => {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
};

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
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const editorRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [showBuilder, setShowBuilder] = useState(false); 
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
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Login failed: " + error.message);
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
        title, content, author: user?.displayName || author, category
      });
      setEditingId(null);
    } else {
      await axios.post(`${API}/api/posts`, {
        title, content, author: user?.displayName || author, category
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

  const handleLike = async (id) => {
    await axios.put(`${API}/api/posts/${id}/like`);
    fetchPosts();
  };

  const handleAddComment = async (postId) => {
    if (!commentText[postId]) return;
    await axios.post(`${API}/api/posts/${postId}/comments`, {
      author: user?.displayName || "Anonymous",
      content: commentText[postId]
    });
    setCommentText({ ...commentText, [postId]: "" });
    fetchPosts();
  };

  const handleDeleteComment = async (postId, commentId) => {
    await axios.delete(`${API}/api/posts/${postId}/comments/${commentId}`);
    fetchPosts();
  };

  const handleShare = (platform, post) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      copy: null
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied! ✅');
      return;
    }
    window.open(links[platform], '_blank');
  };

const handleAIGenerate = async () => {
  if (!aiPrompt) {
    alert("Please enter a topic!");
    return;
  }
  setAiLoading(true);
  try {
    const response = await axios.post(`${API}/api/ai/generate`, {
      prompt: aiPrompt
    });
    const generatedContent = response.data.content;
    setContent(generatedContent);
    setTitle(`Blog about: ${aiPrompt}`);
    if (editorRef.current) {
      editorRef.current.innerHTML = generatedContent;
    }
    setAiPrompt("");
    alert("AI content generated! ✅ Edit it and publish!");
  } catch (err) {
    alert("AI generation failed: " + err.message);
  }
  setAiLoading(false);
};

  const formatText = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
        <h2 style={{ color: "white" }}>Loading Blogify... ⏳</h2>
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
          <p className="login-desc">Your personal blogging platform!</p>
          <button onClick={handleGoogleLogin} className="google-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: "24px", marginRight: "10px" }}
            />
            Continue with Google
          </button>
          <p className="login-footer">Free forever. No credit card required. 🎉</p>
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
          <span style={{ fontSize: "14px" }}>{user.displayName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="container">

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Categories */}
        <div className="category-filter">
          <button
            onClick={() => setActiveCategory("All")}
            className={`cat-btn ${activeCategory === "All" ? "active" : ""}`}
          >All</button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            >{cat}</button>
          ))}
        </div>

        {/* AI Generator */}
        <div className="ai-section">
          <h3>🤖 AI Blog Generator</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter a topic e.g. 'Benefits of meditation'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAIGenerate}
              className="ai-btn"
              disabled={aiLoading}
            >
              {aiLoading ? "Generating... ⏳" : "Generate ✨"}
            </button>
          </div>
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
          <button
  onClick={() => setShowBuilder(true)}
  className="open-builder-btn"
  type="button"
>
  🖱️ Open Page Builder
</button>
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
              <button onClick={handleCancelEdit} className="cancel-btn">
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

                {/* Post Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h3>{post.title}</h3>
                  <span className="category-badge">{post.category}</span>
                </div>

                {/* Reading Time */}
                <div className="reading-time">
                  📖 {calculateReadingTime(post.content)} min read
                </div>

                {/* Content */}
                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

                {/* Meta */}
                <div className="post-meta">
                  ✍️ {post.author} &nbsp;|&nbsp; 📅 {new Date(post.createdAt).toLocaleDateString()}
                </div>

                {/* Action Buttons */}
                <div className="post-actions">

                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(post._id)}
                    className="like-btn"
                  >
                    ❤️ {post.likes || 0}
                  </button>

                  {/* Comments Toggle */}
                  <button
                    onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                    className="comment-toggle-btn"
                  >
                    💬 {post.comments?.length || 0}
                  </button>

                  {/* Share Buttons */}
                  <button onClick={() => handleShare('whatsapp', post)} className="share-btn whatsapp">📱 WhatsApp</button>
                  <button onClick={() => handleShare('twitter', post)} className="share-btn twitter">🐦 Twitter</button>
                  <button onClick={() => handleShare('linkedin', post)} className="share-btn linkedin">💼 LinkedIn</button>
                  <button onClick={() => handleShare('copy', post)} className="share-btn copy">🔗 Copy</button>

                  {/* Edit/Delete */}
                  <button onClick={() => handleEdit(post)} className="edit-btn">✏️</button>
                  <button onClick={() => handleDelete(post._id)} className="delete-btn">🗑️</button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="comments-section">
                    <h4>💬 Comments</h4>

                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="comment">
                        <strong>{comment.author}</strong>
                        <p>{comment.content}</p>
                        <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                        <button
                          onClick={() => handleDeleteComment(post._id, comment._id)}
                          className="delete-comment-btn"
                        >🗑️</button>
                      </div>
                    ))}

                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        className="comment-input"
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="add-comment-btn"
                      >Post 📤</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    {showBuilder && (
  <PageBuilder
    onSave={(html) => {
      setContent((prev) => prev + html);
      if (editorRef.current) {
        editorRef.current.innerHTML = (editorRef.current.innerHTML || "") + html;
      }
      setShowBuilder(false);
    }}
    onClose={() => setShowBuilder(false)}
  />
)}
</div>
)
	}
export default App;
