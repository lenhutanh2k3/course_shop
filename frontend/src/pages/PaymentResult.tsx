import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome, FiShoppingBag, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { clearCart } from '../slices/cartSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function PaymentResult() {
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const verifyPayment = async () => {
            if (location.state?.freeSuccess) {
                setStatus('success');
                setMessage(location.state?.message);
                return;
            }

            const queryParams = location.search;

            if (!queryParams) {
                setStatus('error');
                setMessage('Không tìm thấy thông tin thanh toán.');
                return;
            }

            try {
                const response = await api.get(`/vnpay/callback${queryParams}`);

                if (response.data.success) {
                    setStatus('success');
                    dispatch(clearCart());
                    setMessage(response.data.message || 'Thanh toán thành công. Đơn hàng của bạn đã được ghi nhận.');
                } else {
                    setStatus('failed');
                    setMessage(response.data.message || 'Thanh toán thất bại hoặc người dùng hủy giao dịch.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch.');
            }
        };

        verifyPayment();
    }, [location, dispatch]);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            {status === 'loading' && (
                <div className="flex flex-col items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-700">Đang xác thực thanh toán...</h2>
                    <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10">
                    <FiCheckCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h1>
                    <p className="text-lg text-gray-600 mb-8">{message}</p>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8 text-left text-green-800">
                        <p className="font-bold text-lg mb-3">🎉 Hướng dẫn nhận khóa học:</p>
                        <ul className="list-disc pl-5 space-y-2 font-medium">
                            <li>Chúng tôi vừa tự động gửi một email chứa <b>Link Google Drive (hoặc link tải)</b> tới địa chỉ email bạn đã nhập.</li>
                            <li>Vui lòng kiểm tra Hộp thư đến (hoặc thư mục Spam/Quảng cáo) để lấy link bài học ngay lập tức.</li>
                            <li>Nếu trong vòng 5 phút vẫn chưa nhận được, hãy liên hệ với chúng tôi qua trang Liên hệ để được hỗ trợ.</li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                            <FiHome /> Về trang chủ
                        </Link>
                        {isAuthenticated && (
                            <Link to="/orders" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                                <FiList /> Xem lịch sử mua hàng
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {(status === 'failed' || status === 'error') && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10">
                    <FiXCircle className="text-red-500 w-24 h-24 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Giao dịch không thành công</h1>
                    <p className="text-lg text-gray-600 mb-8">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/cart')} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                            <FiShoppingBag /> Quay lại giỏ hàng
                        </button>
                        <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                            <FiHome /> Về trang chủ
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
