import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfilePage({ user, onClose }) {
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`);
      const filtered = res.data.filter(
        (post) => post.author === (user.displayName || "Anonymous")
      );
      setUserPosts(filtered);
      const totalLikes = filtered.reduce((sum, p) => sum + (p.likes || 0), 0);
      const totalComments = filtered.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
      setStats({ posts: filtered.length, likes: totalLikes, comments: totalComments });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <button className="profile-close-btn" onClick={onClose}>✕</button>
          <div className="profile-avatar-section">
            <img
              src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName}
              alt="avatar"
              className="profile-avatar"
            />
            <h2 className="profile-name">{user.displayName}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-number">{stats.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="profile-stat">
              <span className="stat-number">{stats.likes}</span>
              <span className="stat-label">Likes</span>
            </div>
            <div className="profile-stat">
              <span className="stat-number">{stats.comments}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <h3 className="profile-posts-title">📝 My Posts</h3>
          {loading ? (
            <p className="profile-loading">Loading...</p>
          ) : userPosts.length === 0 ? (
            <p className="profile-empty">No posts yet! Start writing. ✍️</p>
          ) : (
            <div className="profile-posts-list">
              {userPosts.map((post) => (
                <div key={post._id} className="profile-post-card">
                  <div className="profile-post-info">
                    <h4 className="profile-post-title">{post.title}</h4>
                    <span className="profile-post-category">{post.category}</span>
                  </div>
                  <div className="profile-post-meta">
                    <span>❤️ {post.likes || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}