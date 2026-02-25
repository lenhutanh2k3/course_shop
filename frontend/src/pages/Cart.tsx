import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { removeFromCart, clearCart } from '../slices/cartSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function Cart() {
    const dispatch = useDispatch<AppDispatch>();
    const { items } = useSelector((state: RootState) => state.cart);
    const navigate = useNavigate();

    const handleRemoveItem = (courseId: number) => {
        dispatch(removeFromCart(courseId));
        toast.success('Đã xóa khóa học khỏi giỏ hàng');
    };

    const handleClearCart = () => {
        if (!window.confirm('Bạn có chắc chắn muốn làm trống giỏ hàng?')) return;
        dispatch(clearCart());
        toast.success('Đã làm trống giỏ hàng');
    };

    const handleCheckout = () => {
        if (items.length === 0) return;
        navigate('/checkout');
    };

    const totalAmount = items.reduce((total, item) => total + (item.course.discounted_price || 0), 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FiShoppingBag className="text-blue-600" />
                Giỏ hàng của bạn
            </h1>

            {items.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiShoppingBag className="text-3xl text-gray-300" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Giỏ hàng trống</h2>
                    <p className="text-gray-500 mb-6 text-sm">Bạn chưa thêm khóa học nào vào giỏ hàng.</p>
                    <Link
                        to="/courses"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                        Khám phá khóa học ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                            <span className="font-semibold text-gray-700">{items.length} Khóa học (Link Drive)</span>
                            <button
                                onClick={handleClearCart}
                                className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                            >
                                Làm sạch giỏ hàng
                            </button>
                        </div>

                        {items.map((item) => (
                            <div key={item.course.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative">
                                <img
                                    src={item.course.image_url}
                                    alt={item.course.title}
                                    className="w-full sm:w-32 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <Link to={`/courses/${item.course.slug}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition block mb-1 pr-8">
                                        {item.course.title}
                                    </Link>
                                    <div className="flex items-center gap-2 text-green-600 text-sm mb-2 font-medium">
                                        <FiCheckCircle /> Giao Link Drive tự động
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-blue-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.course.discounted_price)}
                                        </span>
                                        {item.course.original_price > item.course.discounted_price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.course.original_price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.course.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition sm:static"
                                    title="Xóa"
                                >
                                    <FiTrash2 size={20} />
                                </button>
                            </div>
                        ))}

                        <div className="pt-4">
                            <Link to="/courses" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
                                <FiArrowLeft className="mr-2" /> Tiếp tục tìm khóa học
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-5">Thanh toán</h2>
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                                    </span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-base font-bold text-gray-900">
                                    <span>Thành tiền</span>
                                    <span className="text-xl text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-xs text-blue-800">
                                <p className="font-medium mb-1">Hướng dẫn nhận khóa học:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Bấm nút Thanh toán để xem thông tin chuyển khoản.</li>
                                    <li>Chuyển khoản theo đúng nội dung.</li>
                                    <li>Link Google Drive sẽ được cấp quyền cho Email của bạn.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-sm"
                            >
                                Tiến hành thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
