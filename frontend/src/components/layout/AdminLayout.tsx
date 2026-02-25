import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHome, FiBook, FiList, FiLogOut, FiMenu, FiX, FiUsers, FiShoppingCart } from 'react-icons/fi';
import { useState } from 'react';
import { logout } from '../../slices/authSlice';
import type { AppDispatch, RootState } from '../../redux/store';

export default function AdminLayout() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
        { path: '/admin/courses', label: 'Quản lý khóa học', icon: <FiBook /> },
        { path: '/admin/categories', label: 'Quản lý danh mục', icon: <FiList /> },
        { path: '/admin/orders', label: 'Quản lý đơn hàng', icon: <FiShoppingCart /> },
        { path: '/admin/users', label: 'Người dùng', icon: <FiUsers /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
                    <span className="text-xl font-bold">Admin Panel</span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)} // Close on mobile click
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="mr-3 text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors mt-8"
                    >
                        <span className="mr-3 text-xl"><FiLogOut /></span>
                        <span>Đăng xuất</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <FiMenu size={24} />
                    </button>
                    <div className="flex items-center space-x-4 ml-auto">
                        <span className="text-gray-700">Xin chào, <strong>{user?.name}</strong></span>
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
