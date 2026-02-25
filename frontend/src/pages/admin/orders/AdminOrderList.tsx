import { useState, useEffect } from 'react';
import {
    FiSearch, FiFilter, FiEye, FiCheckCircle, FiXCircle, FiClock
} from 'react-icons/fi';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Order {
    id: number;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    user_id: number | null;
    user: { name: string; email: string } | null;
    total_amount: number;
    status: string;
    payment_method: string;
    created_at: string;
}

export default function AdminOrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Sorting
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status,
                payment_method: paymentMethod,
                date_from: dateFrom,
                date_to: dateTo,
                sort_by: sortBy,
                sort_order: sortOrder
            });

            const response = await api.get(`/admin/orders?${params.toString()}`);
            // The backend returns successResponse which wraps the paginator in a "data" property
            const paginator = response.data.data;
            setOrders(paginator.data ? paginator.data : paginator);
            setTotalPages(paginator.last_page ? paginator.last_page : 1);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, status, paymentMethod, dateFrom, dateTo, sortBy, sortOrder]);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchOrders();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center"><FiCheckCircle className="mr-1" /> Thành công</span>;
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center"><FiClock className="mr-1" /> Đang xử lý</span>;
            case 'failed': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center"><FiXCircle className="mr-1" /> Thất bại</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center"><FiXCircle className="mr-1" /> Đã hủy</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    const getCustomerInfo = (order: Order) => {
        if (order.user) {
            return (
                <div>
                    <div className="font-semibold text-gray-900">{order.user.name} <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-1">Member</span></div>
                    <div className="text-sm text-gray-500">{order.user.email}</div>
                </div>
            );
        }
        return (
            <div>
                <div className="font-semibold text-gray-900">{order.guest_name} <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded ml-1">Guest</span></div>
                <div className="text-sm text-gray-500">{order.guest_email}</div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h2>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Tìm theo Mã, Tên, Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-gray-500 font-semibold mr-2">
                    <FiFilter className="mr-2" /> Lọc:
                </div>

                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border-gray-300 rounded-lg text-sm">
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Đang xử lý</option>
                    <option value="completed">Thành công</option>
                    <option value="failed">Thất bại</option>
                    <option value="cancelled">Đã hủy</option>
                </select>

                <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }} className="border-gray-300 rounded-lg text-sm">
                    <option value="">Tất cả thanh toán</option>
                    <option value="vnpay">VNPay</option>
                </select>

                <div className="flex items-center space-x-2">
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="border-gray-300 rounded-lg text-sm" />
                    <span className="text-gray-400">-</span>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="border-gray-300 rounded-lg text-sm" />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Mã ĐH</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Khách hàng</th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => handleSort('total_amount')}
                                >
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Phương thức</th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Ngày đặt
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 tracking-wider">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center mb-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                        Đang tải danh sách...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không có đơn hàng nào khớp với điều kiện lọc.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getCustomerInfo(order)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase font-semibold">
                                            {order.payment_method}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors inline-block"
                                                title="Xem chi tiết"
                                            >
                                                <FiEye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                        >
                            Trang trước
                        </button>
                        <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
