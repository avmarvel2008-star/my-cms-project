import { useState, useEffect } from "react";
import axios from "axios";

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

  const formatText = (command) => {
    document.execCommand(command, false, null);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>📝 My CMS Blog</h1>

      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h2>Create New Post</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px" }}
        />

        {/* Toolbar */}
        <div style={{ background: "#ddd", padding: "5px", marginBottom: "0", borderRadius: "4px 4px 0 0" }}>
          <button onClick={() => formatText("bold")} style={{ marginRight: "5px", padding: "5px 10px", fontWeight: "bold" }}>B</button>
          <button onClick={() => formatText("italic")} style={{ marginRight: "5px", padding: "5px 10px", fontStyle: "italic" }}>I</button>
          <button onClick={() => formatText("underline")} style={{ marginRight: "5px", padding: "5px 10px", textDecoration: "underline" }}>U</button>
          <button onClick={() => formatText("insertUnorderedList")} style={{ marginRight: "5px", padding: "5px 10px" }}>• List</button>
        </div>

        {/* Editor */}
        <div
          id="editor"
          contentEditable
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          style={{
            border: "1px solid #ccc",
            minHeight: "150px",
            padding: "10px",
            marginBottom: "10px",
            background: "white",
            borderRadius: "0 0 4px 4px"
          }}
          suppressContentEditableWarning={true}
        />

        <input
          type="text"
          placeholder="Author name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px" }}
        />

        <button
          onClick={handleSubmit}
          style={{ background: "#4CAF50", color: "white", padding: "12px 30px", fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Publish Post 🚀
        </button>
      </div>

      <h2>All Blog Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet! Create your first post above! 👆</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} style={{ background: "white", border: "1px solid #ddd", padding: "20px", marginBottom: "15px", borderRadius: "8px" }}>
            <h3>{post.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            <small>By: {post.author} | {new Date(post.createdAt).toLocaleDateString()}</small>
            <br/>
            <button
              onClick={() => handleDelete(post._id)}
              style={{ background: "red", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}
            >
              Delete 🗑️
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;