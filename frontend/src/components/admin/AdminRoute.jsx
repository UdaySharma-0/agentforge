import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spinner } from "../ui";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isBootstrapping, user } = useSelector((state) => state.auth);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
