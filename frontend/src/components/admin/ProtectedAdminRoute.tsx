import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const ProtectedAdminRoute = () => {
    const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Đang xác thực quyền Admin...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: window.location.pathname }} replace />;
    }

    if (user && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
