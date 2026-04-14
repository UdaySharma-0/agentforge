import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Shield, ShieldOff, UsersRound } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
} from "../../components/ui";
import { getUsers, updateUserRole } from "../../services/adminApi";

function getRoleBadgeVariant(role) {
  return role === "admin" ? "primary" : "default";
}

export default function Users() {
  const currentUser = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getUsers();
        setUsers(response.users || []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const counts = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    return {
      total: users.length,
      admins,
      members: users.length - admins,
    };
  }, [users]);

  const handleRoleChange = async (userId, role) => {
    try {
      setUpdatingUserId(userId);
      setError("");
      const response = await updateUserRole(userId, role);
      const updatedUser = response.user;

      setUsers((current) =>
        current.map((user) => (user._id === updatedUser._id ? updatedUser : user)),
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update role");
    } finally {
      setUpdatingUserId("");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {user.name || "Unnamed User"}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role || "user"}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => {
        const isSelf = currentUser?.id === user._id;
        const nextRole = user.role === "admin" ? "user" : "admin";
        const actionLabel =
          nextRole === "admin" ? "Promote to Admin" : "Demote to User";

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={nextRole === "admin" ? "primary" : "secondary"}
              disabled={isSelf}
              isLoading={updatingUserId === user._id}
              leftIcon={
                nextRole === "admin" ? <Shield size={14} /> : <ShieldOff size={14} />
              }
              onClick={() => handleRoleChange(user._id, nextRole)}
            >
              {isSelf ? "Current Admin" : actionLabel}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Users" value={counts.total} />
        <MetricCard label="Admins" value={counts.admins} accent="text-indigo-500" />
        <MetricCard label="Members" value={counts.members} accent="text-sky-500" />
      </div>

      <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>User roles</CardTitle>
            <CardDescription>
              Promote or demote workspace members using backend-enforced admin controls.
            </CardDescription>
          </div>
          <div className="hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-500 sm:flex">
            <UsersRound size={18} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <Table
            columns={columns}
            data={loading ? [] : users}
            rowKey="_id"
            emptyText={loading ? "Loading users..." : "No users found."}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, accent = "text-slate-900 dark:text-slate-100" }) {
  return (
    <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={accent}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
