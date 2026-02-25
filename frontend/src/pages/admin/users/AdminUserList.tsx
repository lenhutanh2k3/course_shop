import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiUser, FiShield, FiAlertTriangle } from 'react-icons/fi';
import {
    FiSearch, FiFilter, FiRefreshCw, FiUserX, FiUserCheck, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string | null;
    created_at: string;
    deleted_at?: string | null;
}

export default function AdminUserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(15);

    // Filters
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [isDeleted, setIsDeleted] = useState('');

    // Sorting
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                role,
                status,
                is_deleted: isDeleted,
                sort_by: sortBy,
                sort_order: sortOrder
            });

            const response = await api.get(`/admin/users?${params.toString()}`);
            setUsers(response.data.data);
            setTotalPages(response.data.last_page);
            setPerPage(response.data.per_page || 15);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, role, status, isDeleted, sortBy, sortOrder]);

    // Handle Search Input Wait
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleToggleRole = async (user: User) => {
        try {
            if (confirm(`Bạn có chắc muốn cấp/tước quyền Admin của ${user.name}?`)) {
                const newRole = user.role === 'admin' ? 'user' : 'admin';
                await api.put(`/admin/users/${user.id}`, { role: newRole });
                toast.success(`Đã cập nhật quyền cho ${user.name}`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            if (confirm(`Bạn muốn đưa ${user.name} vào thùng rác?`)) {
                await api.delete(`/admin/users/${user.id}`);
                toast.success(`Đã xóa tạm thời người dùng ${user.name}`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
        }
    };

    const handleForceDeleteUser = async (user: User) => {
        try {
            if (confirm(`CẢNH BÁO: Xóa vĩnh viễn ${user.name}? Dữ liệu không thể khôi phục.`)) {
                await api.delete(`/admin/users/${user.id}/force`);
                toast.success(`Đã xóa vĩnh viễn người dùng ${user.name}`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa vĩnh viễn');
        }
    };

    const handleRestoreUser = async (user: User) => {
        try {
            if (confirm(`Khôi phục tài khoản ${user.name}?`)) {
                await api.put(`/admin/users/${user.id}/restore`);
                toast.success(`Đã khôi phục người dùng ${user.name}`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục');
        }
    };

    const handleToggleBan = async (user: User) => {
        try {
            const actionText = user.status === 'banned' ? 'Mở khóa' : 'Khóa';
            if (confirm(`Bạn muốn ${actionText} tài khoản ${user.name}?`)) {
                await api.put(`/admin/users/${user.id}/ban`);
                toast.success(`Đã ${actionText} tài khoản ${user.name}`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Có lỗi khi ${user.status === 'banned' ? 'mở khóa' : 'khóa'}`);
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
        return sortOrder === 'asc'
            ? <FiArrowUp className="inline ml-1 text-blue-600" />
            : <FiArrowDown className="inline ml-1 text-blue-600" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Tìm theo tên/email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-gray-500">
                    <FiFilter className="mr-2" /> <span className="font-semibold text-sm">Lọc:</span>
                </div>

                <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setPage(1); }}
                    className="border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Tất cả quyền</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="user">Người dùng</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động (Active)</option>
                    <option value="banned">Bị khóa (Banned)</option>
                </select>

                <select
                    value={isDeleted}
                    onChange={(e) => { setIsDeleted(e.target.value); setPage(1); }}
                    className="border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Tất cả tài khoản</option>
                    <option value="false">Đang tồn tại</option>
                    <option value="true">Đã xóa (Thùng rác)</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 tracking-wider w-16">
                                    STT
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Người dùng <SortIcon field="name" />
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('role')}
                                >
                                    Vai trò <SortIcon field="role" />
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('status')}
                                >
                                    Trạng thái <SortIcon field="status" />
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Ngày tham gia <SortIcon field="created_at" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 tracking-wider whitespace-nowrap">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center mb-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                        Đang tải danh sách...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center mb-4">
                                            <FiAlertTriangle className="h-12 w-12 text-yellow-500" />
                                        </div>
                                        Không tìm thấy dữ liệu phù hợp
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.deleted_at ? 'bg-red-50 opacity-75' : ''}`}>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                                            {(page - 1) * perPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 relative">
                                                    {user.avatar ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-400">
                                                            <FiUser />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${user.deleted_at ? 'text-red-700 line-through' : 'text-gray-900'}`}>
                                                        {user.name}
                                                        {user.deleted_at && <span className="ml-2 text-xs text-red-500 font-normal border border-red-500 rounded px-1">Đã xóa</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role === 'admin' ? (
                                                    <><FiShield className="mr-1" /> Quản trị viên</>
                                                ) : (
                                                    <><FiUser className="mr-1" /> Người dùng</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'banned'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.status === 'banned' ? 'Bị khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center space-x-2">
                                                {user.deleted_at ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestoreUser(user)}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors tooltip"
                                                            title="Khôi phục tài khoản"
                                                        >
                                                            <FiRefreshCw size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleForceDeleteUser(user)}
                                                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors tooltip"
                                                            title="Xóa vĩnh viễn"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleRole(user)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors tooltip"
                                                            title={user.role === 'admin' ? "Hạ cấp quyền" : "Nâng cấp Admin"}
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleBan(user)}
                                                            className={`p-2 rounded-lg transition-colors tooltip ${user.status === 'banned'
                                                                ? 'text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100'
                                                                : 'text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100'
                                                                }`}
                                                            title={user.status === 'banned' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                                        >
                                                            {user.status === 'banned' ? <FiUserCheck size={18} /> : <FiUserX size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors tooltip"
                                                            title="Xóa tạm thời (Vào thùng rác)"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${page === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-600">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${page === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
