import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { FiList, FiClock, FiCheckCircle, FiXCircle, FiDownload, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import type { RootState } from '../redux/store';

interface OrderCourse {
    id: number;
    title: string;
    slug: string;
    image_url: string;
    download_file_path: string | null;
    download_file_name: string | null;
}

interface OrderItem {
    id: number;
    course_id: number;
    price: number;
    course: OrderCourse;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    vnp_txn_ref: string;
    created_at: string;
    items: OrderItem[];
}

export default function OrderHistory() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"><FiCheckCircle /> Đã thanh toán</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium"><FiClock /> Chờ thanh toán</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"><FiXCircle /> Thất bại</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">{status}</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors group text-sm"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FiList className="text-blue-600" />
                Lịch sử mua hàng
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiList className="text-3xl text-gray-300" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Chưa có đơn hàng nào</h2>
                    <p className="text-gray-500 mb-6 text-sm">Bạn chưa mua khóa học nào trên hệ thống.</p>
                    <Link
                        to="/courses"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                        Khám phá khóa học ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-gray-900">Đơn hàng #{order.id}</h3>
                                    <div className="text-xs text-gray-500 flex items-center gap-3">
                                        <span>Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                        <span>Mã GD: {order.vnp_txn_ref}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    {getStatusBadge(order.status)}
                                    <span className="font-bold text-base text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2 text-sm">Khóa học trong đơn</h4>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-2 border-b last:border-0 border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <img src={item.course.image_url} alt={item.course.title} className="w-14 h-10 object-cover rounded-md" />
                                                <div>
                                                    <Link to={`/courses/${item.course.slug}`} className="font-bold text-sm text-gray-900 hover:text-blue-600 transition block leading-tight mb-0.5">
                                                        {item.course.title}
                                                    </Link>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                {order.status === 'completed' && item.course.download_file_path ? (
                                                    <a
                                                        href={item.course.download_file_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition whitespace-nowrap"
                                                    >
                                                        <FiDownload /> Vào học / Tải tài liệu
                                                    </a>
                                                ) : order.status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg font-medium whitespace-nowrap">
                                                        Đang cập nhật link
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
