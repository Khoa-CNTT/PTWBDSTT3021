import './adminPage.scss'
import apiRequest from "../../lib/apiRequest.js";
import { useEffect, useState } from "react";

function AdminPage() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsRes, usersRes, postsRes] = await Promise.all([
          apiRequest.get("/admins"),
          apiRequest.get("/admins/users"),
          apiRequest.get("/admins/posts"),
        ]);

        setAdmins(adminsRes.data);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const deleteUser = async (id) => {
    try {
      await apiRequest.delete(`/admins/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const approvePost = async (id) => {
    try {
      await apiRequest.put(`/admins/posts/approve/${id}`);
      setPosts((prevPosts) => prevPosts.map((post) => (post.id === id ? { ...post, approved: true } : post)));
    } catch (err) {
      console.error("Failed to approve post:", err);
    }
  };

  const deletePost = async (id) => {
    try {
      await apiRequest.delete(`/admins/posts/${id}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <div className="adminPage">
      <h1>Admin Dashboard</h1>

      {/* <section>
        <h2>Admins</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.username}</td>
                <td>{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section> */}

      <section>
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Posts</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.approved ? "Yes" : "No"}</td>
                <td>
                  {!post.approved && (
                    <button onClick={() => approvePost(post.id)}>Approve</button>
                  )}
                  <button onClick={() => deletePost(post.id)} style={{ marginLeft: '8px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminPage

