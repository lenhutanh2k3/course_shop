import { useState, useEffect } from 'react';
import { FiBook, FiUsers, FiDollarSign, FiShoppingCart, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_users: number;
    total_courses: number;
    recent_orders: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        total_revenue: 0,
        total_orders: 0,
        total_users: 0,
        total_courses: 0,
        recent_orders: [],
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartDays, setChartDays] = useState(7); // default 7 days

    useEffect(() => {
        fetchDashboardData();
    }, [chartDays]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, chartRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get(`/admin/dashboard/chart?days=${chartDays}`)
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Tổng Doanh Thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.total_revenue), icon: <FiDollarSign />, color: 'bg-green-500' },
        { label: 'Tổng Đơn Hàng', value: stats.total_orders, icon: <FiShoppingCart />, color: 'bg-blue-500' },
        { label: 'Học Viên', value: stats.total_users, icon: <FiUsers />, color: 'bg-purple-500' },
        { label: 'Khóa Học', value: stats.total_courses, icon: <FiBook />, color: 'bg-yellow-500' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center w-max"><FiCheckCircle className="mr-1" /> Thành công</span>;
            case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold flex items-center w-max"><FiClock className="mr-1" /> Đang xử lý</span>;
            case 'failed': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold flex items-center w-max"><FiXCircle className="mr-1" /> Thất bại</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold flex items-center w-max"><FiXCircle className="mr-1" /> Đã hủy</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">{status}</span>;
        }
    };

    if (loading && stats.total_orders === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Tổng quan Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-xl text-white mr-4 shadow-sm ${stat.color}`}>
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>
                        <select
                            value={chartDays}
                            onChange={(e) => setChartDays(Number(e.target.value))}
                            className="border-gray-300 rounded-lg text-sm bg-gray-50"
                        >
                            <option value={7}>7 ngày qua</option>
                            <option value={14}>14 ngày qua</option>
                            <option value={30}>30 ngày qua</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000000}M`}
                                />
                                <Tooltip
                                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiClock className="mr-2" /> Đơn hàng gần đây
                    </h3>

                    <div className="flex-1 overflow-y-auto">
                        {stats.recent_orders.length > 0 ? (
                            <ul className="space-y-4">
                                {stats.recent_orders.map((order) => (
                                    <li key={order.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-800">#{order.id}</span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2 truncate">
                                            {order.user ? order.user.name : order.guest_name}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            {getStatusBadge(order.status)}
                                            <span className="font-bold text-red-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <FiShoppingCart size={40} className="mb-4 opacity-50" />
                                <p>Chưa có đơn hàng nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
