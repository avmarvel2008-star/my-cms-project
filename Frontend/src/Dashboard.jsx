import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard({ user, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`);
      const myPosts = res.data.filter(
        (p) => p.author === (user.displayName || "Anonymous")
      );
      setPosts(myPosts);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const topPost = posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-modal">
        <div className="dashboard-header">
          <h2>📊 My Dashboard</h2>
          <button className="builder-close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p className="dashboard-loading">Loading analytics...</p>
        ) : (
          <div className="dashboard-body">

            {/* Stats Cards */}
            <div className="dashboard-stats">
              <div className="dash-stat-card blue">
                <span className="dash-stat-icon">📝</span>
                <span className="dash-stat-number">{posts.length}</span>
                <span className="dash-stat-label">Total Posts</span>
              </div>
              <div className="dash-stat-card red">
                <span className="dash-stat-icon">❤️</span>
                <span className="dash-stat-number">{totalLikes}</span>
                <span className="dash-stat-label">Total Likes</span>
              </div>
              <div className="dash-stat-card green">
                <span className="dash-stat-icon">💬</span>
                <span className="dash-stat-number">{totalComments}</span>
                <span className="dash-stat-label">Total Comments</span>
              </div>
              <div className="dash-stat-card purple">
                <span className="dash-stat-icon">🏆</span>
                <span className="dash-stat-number">{topPost?.likes || 0}</span>
                <span className="dash-stat-label">Best Post Likes</span>
              </div>
            </div>

            {/* Top Post */}
            {topPost && (
              <div className="dash-top-post">
                <h3>🏆 Top Performing Post</h3>
                <div className="dash-top-post-card">
                  <h4>{topPost.title}</h4>
                  <div className="dash-top-post-meta">
                    <span>❤️ {topPost.likes || 0} likes</span>
                    <span>💬 {topPost.comments?.length || 0} comments</span>
                    <span>📅 {new Date(topPost.createdAt).toLocaleDateString()}</span>
                    <span className="dash-category">{topPost.category}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Table */}
            <div className="dash-posts-table">
              <h3>📋 All Posts Performance</h3>
              {posts.length === 0 ? (
                <p className="dash-empty">No posts yet! Start writing ✍️</p>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>❤️ Likes</th>
                      <th>💬 Comments</th>
                      <th>📅 Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post._id}>
                        <td className="dash-post-title">{post.title}</td>
                        <td><span className="dash-category">{post.category}</span></td>
                        <td className="dash-center">{post.likes || 0}</td>
                        <td className="dash-center">{post.comments?.length || 0}</td>
                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}