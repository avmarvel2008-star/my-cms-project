import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Notifications({ user, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`);
      const myPosts = res.data.filter(
        (p) => p.author === (user.displayName || "Anonymous")
      );

      const notifs = [];
      myPosts.forEach((post) => {
        if (post.likes > 0) {
          notifs.push({
            id: `like-${post._id}`,
            type: "like",
            icon: "❤️",
            message: `Your post "${post.title}" has ${post.likes} like${post.likes > 1 ? "s" : ""}!`,
            time: new Date(post.updatedAt || post.createdAt),
            color: "#f5576c"
          });
        }
        if (post.comments?.length > 0) {
          notifs.push({
            id: `comment-${post._id}`,
            type: "comment",
            icon: "💬",
            message: `Your post "${post.title}" has ${post.comments.length} comment${post.comments.length > 1 ? "s" : ""}!`,
            time: new Date(post.updatedAt || post.createdAt),
            color: "#667eea"
          });
          // Individual comment notifications
          post.comments.slice(-2).forEach((comment, i) => {
            notifs.push({
              id: `comment-detail-${post._id}-${i}`,
              type: "comment",
              icon: "💬",
              message: `${comment.author || "Someone"} commented on "${post.title}": "${comment.content?.slice(0, 40)}..."`,
              time: new Date(comment.createdAt || post.createdAt),
              color: "#764ba2"
            });
          });
        }
      });

      // Sort by newest first
      notifs.sort((a, b) => b.time - a.time);

      if (notifs.length === 0) {
        notifs.push({
          id: "welcome",
          type: "info",
          icon: "👋",
          message: "Welcome to Blogify! Start writing posts to get likes and comments.",
          time: new Date(),
          color: "#43e97b"
        });
      }

      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const timeAgo = (date) => {
    const diff = (new Date() - date) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notif-overlay">
      <div className="notif-modal">
        <div className="notif-header">
          <h2>🔔 Notifications</h2>
          <button className="builder-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="notif-body">
          {loading ? (
            <p className="notif-loading">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet! 🎉</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="notif-item">
                <div
                  className="notif-icon"
                  style={{ background: notif.color + "22", color: notif.color }}
                >
                  {notif.icon}
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{timeAgo(notif.time)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}