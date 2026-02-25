import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiCreditCard, FiLock, FiUser, FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { clearCart } from '../slices/cartSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function Checkout() {
    const { items } = useSelector((state: RootState) => state.cart);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    if (items.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    const totalAmount = items.reduce((total, item) => total + Number(item.course.discounted_price || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated && (!guestInfo.name || !guestInfo.email)) {
            toast.error('Vui lòng nhập đầy đủ họ tên và email để nhận khóa học.');
            return;
        }

        setLoading(true);
        try {
            const courseIds = items.map(item => item.course.id);
            const payload = isAuthenticated ? { course_ids: courseIds } : {
                course_ids: courseIds,
                guest_name: guestInfo.name,
                guest_email: guestInfo.email,
                guest_phone: guestInfo.phone
            };

            const response = await api.post('/checkout', payload);

            if (response.data && response.data.data.is_free) {
                toast.success('Mua khóa học thành công!');
                dispatch(clearCart());
                navigate('/payment-result', {
                    state: {
                        freeSuccess: true,
                        message: 'Nhận khóa học miễn phí thành công. Vui lòng kiểm tra email của bạn để lấy link bài học.'
                    }
                });
            } else if (response.data && response.data.data.payment_url) {
                toast.success('Đang chuyển hướng đến cổng thanh toán VNPay...');
                window.location.href = response.data.data.payment_url;
            } else {
                toast.error('Có lỗi xảy ra, không tìm thấy đường dẫn thanh toán.');
                setLoading(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors group text-sm"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FiCreditCard className="text-blue-600" />
                Thanh toán an toàn
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check out form */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Thông tin thanh toán</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isAuthenticated ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                                <div className="flex items-center gap-3 text-blue-800 font-medium mb-2">
                                    <FiUser /> {user?.name}
                                </div>
                                <div className="flex items-center gap-3 text-blue-800 font-medium">
                                    <FiMail /> {user?.email}
                                </div>
                                <p className="text-sm text-blue-600 mt-4">
                                    Bạn đang thanh toán bằng tài khoản thành viên. Link Google Drive khóa học sẽ được gửi qua email này và lưu trong Lịch sử mua hàng.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-4 text-sm text-yellow-800">
                                    Bạn đang mua hàng dưới tư cách khách không đăng nhập. Vui lòng nhập chính xác email để chúng tôi gửi link bài học.
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border"
                                            placeholder="Nguyễn Văn A"
                                            value={guestInfo.name}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email nhận khóa học *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border"
                                            placeholder="email@example.com"
                                            value={guestInfo.email}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (Tùy chọn)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 border"
                                            placeholder="0912345678"
                                            value={guestInfo.phone}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
                            >
                                {loading ? 'Đang xử lý...' : (totalAmount === 0 ? 'Xác nhận nhận khóa học' : 'Thanh toán qua VNPay')}
                            </button>
                        </div>
                        {totalAmount > 0 && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                                <FiLock /> Thanh toán được bảo mật an toàn qua VNPay
                            </div>
                        )}
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Khóa học sẽ mua</h2>
                    <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-2">
                        {items.map((item) => (
                            <div key={item.course.id} className="flex gap-3">
                                <img src={item.course.image_url} alt={item.course.title} className="w-14 h-10 object-cover rounded-md" />
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{item.course.title}</h4>
                                    <div className="text-blue-600 font-semibold text-xs mt-1">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.course.discounted_price)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-base font-bold text-gray-900">
                        <span>Tổng thanh toán</span>
                        <span className="text-xl text-blue-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
