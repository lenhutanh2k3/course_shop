import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiCreditCard, FiUser, FiInfo, FiBook } from 'react-icons/fi';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';

interface OrderDetail {
    id: number;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    user_id: number | null;
    user: { id: number; name: string; email: string } | null;
    total_amount: number;
    status: string;
    payment_method: string;
    vnp_txn_ref: string | null;
    created_at: string;
    items: {
        id: number;
        course_id: number;
        price: number;
        course: {
            title: string;
            image_url: string | null;
        } | null;
    }[];
}

export default function AdminOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            toast.error('Không tìm thấy đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            setUpdating(true);
            await api.put(`/admin/orders/${id}/status`, { status: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            fetchOrder(); // Reload
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (!order) {
        return <div className="text-center py-20 text-gray-500">Đơn hàng không tồn tại.</div>;
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center w-max"><FiCheckCircle className="mr-2" /> Hoàn tất</span>;
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center w-max"><FiClock className="mr-2" /> Đang chờ</span>;
            case 'failed': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold flex items-center w-max"><FiXCircle className="mr-2" /> Lỗi / Hủy thanh toán</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold flex items-center w-max"><FiXCircle className="mr-2" /> Đã hủy</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/orders" className="text-gray-500 hover:text-blue-600 p-2 bg-white rounded-full shadow-sm">
                        <FiArrowLeft size={24} />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{order.id}</h2>
                </div>
                <div>
                    {getStatusBadge(order.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Items & Summary) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center bg-gray-50">
                            <FiBook className="mr-2" /> Sản phẩm đã mua ({order.items.length})
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-6 flex items-start space-x-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-24 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                        {item?.course?.image_url ? (
                                            <img src={item.course.image_url} alt={item.course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Hình ảnh</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-800">{item.course?.title || 'Khóa học không tồn tại'}</h4>
                                        <p className="text-gray-500 text-sm mt-1">ID Course: {item.course_id}</p>
                                    </div>
                                    <div className="text-right font-bold text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="p-6 bg-gray-50 flex justify-between items-center text-lg border-t border-gray-100">
                            <span className="font-bold text-gray-800">Tổng tiền thanh toán:</span>
                            <span className="font-bold text-2xl text-red-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center bg-gray-50">
                            <FiCreditCard className="mr-2" /> Thông tin thanh toán
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Phương thức</p>
                                <p className="font-bold text-gray-800 uppercase">{order.payment_method}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mã GD VNPay</p>
                                <p className="font-mono text-gray-800">{order.vnp_txn_ref || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày giao dịch</p>
                                <p className="font-medium text-gray-800">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Customer & Actions) */}
                <div className="space-y-6">

                    {/* Customer Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center bg-gray-50">
                            <FiUser className="mr-2" /> Thông tin khách hàng
                        </div>
                        <div className="p-6 space-y-4">
                            {order.user ? (
                                <div>
                                    <div className="mb-2"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Registered Member</span></div>
                                    <p className="font-bold text-lg text-gray-800">{order.user.name}</p>
                                    <p className="text-gray-600">{order.user.email}</p>
                                    <p className="text-sm text-gray-400 mt-2">ID Tài khoản: {order.user.id}</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-2"><span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded border">Guest Checkout</span></div>
                                    <p className="font-bold text-lg text-gray-800">{order.guest_name}</p>
                                    <p className="text-gray-600">{order.guest_email}</p>
                                    {order.guest_phone && <p className="text-gray-600">{order.guest_phone}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Update Status */}
                    <div className="bg-white flex flex-col items-center justify-center p-6 rounded-xl shadow-sm border text-center border-gray-100">
                        <div className="w-full">
                            <p className="text-sm text-gray-500 mb-2 text-left font-bold">Cập nhật trạng thái</p>
                            <select
                                className="w-full border-gray-300 rounded-lg text-sm mb-4"
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                disabled={updating}
                            >
                                <option value="pending">Đang chờ</option>
                                <option value="completed">Hoàn tất</option>
                                <option value="failed">Thất bại</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg text-left flex items-start">
                                <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
                                <span>Chú ý: Thay đổi trạng thái thủ công nhưng không thực hiện hoàn tiền tự động qua VNPay.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
