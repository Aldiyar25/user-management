import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
      setSelectedIds([]);
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to load users");
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [fetchUsers, navigate]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = filteredUsers.map((u) => u.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids]))
    );
  };

  const formatDate = (dt) => (dt ? new Date(dt).toLocaleString() : "-");

  const token = localStorage.getItem("token");
  let currentUserId = null;
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      currentUserId = payload.id;
    } catch (e) {
      console.error("Failed to parse token", e);
    }
  }

  const blockSelected = async () => {
    try {
      await axios.put(`${API_URL}/users/block`, { ids: selectedIds });
      if (selectedIds.includes(currentUserId)) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setSuccessMsg(`Blocked: ${selectedIds.length}`);
      setUsers((prev) =>
        prev.map((u) =>
          selectedIds.includes(u.id) ? { ...u, status: "blocked" } : u
        )
      );
      setSelectedIds([]);
    } catch {
      setErrorMsg("Failed to block");
    }
  };

  const unblockSelected = async () => {
    try {
      await axios.put(`${API_URL}/users/unblock`, { ids: selectedIds });
      setSuccessMsg(`Unblocked: ${selectedIds.length}`);
      setUsers((prev) =>
        prev.map((u) =>
          selectedIds.includes(u.id) ? { ...u, status: "active" } : u
        )
      );
      setSelectedIds([]);
    } catch {
      setErrorMsg("Failed to unblock");
    }
  };

  const deleteSelected = async () => {
    try {
      await axios.delete(`${API_URL}/users`, { data: { ids: selectedIds } });
      if (selectedIds.includes(currentUserId)) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setSuccessMsg(`Deleted: ${selectedIds.length}`);
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      setSelectedIds([]);
    } catch {
      setErrorMsg("Failed to delete");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">User Management</h2>
      <div className="d-flex align-items-center mb-3 flex-wrap">
        <div className="btn-group me-3 mb-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={blockSelected}
            disabled={!selectedIds.length}
          >
            Block
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={unblockSelected}
            disabled={!selectedIds.length}
            title="Unblock"
          >
            <i className="fas fa-unlock"></i>
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!selectedIds.length}
            title="Delete"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
        <input
          type="text"
          className="form-control me-3 mb-2"
          placeholder="Filter by name or email"
          style={{ maxWidth: "300px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <button
          className="btn btn-outline-secondary ms-auto mb-2"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }}
        >
          Log out
        </button>
      </div>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    filteredUsers.length > 0 &&
                    filteredUsers.every((u) => selectedIds.includes(u.id))
                  }
                  ref={(el) => {
                    if (el)
                      el.indeterminate =
                        selectedIds.length > 0 &&
                        !filteredUsers.every((u) => selectedIds.includes(u.id));
                  }}
                  aria-label="Select All"
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Registration</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const sel = selectedIds.includes(u.id);
              return (
                <tr key={u.id} className={sel ? "table-primary" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => toggleSelect(u.id)}
                      aria-label={`Select ${u.id}`}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.status === "active" ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-danger">Blocked</span>
                    )}
                  </td>
                  <td>{formatDate(u.last_login)}</td>
                  <td>{formatDate(u.registered_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                />
              </div>
              <div className="modal-body">
                <p>Delete {selectedIds.length} user(s)?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteSelected}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
