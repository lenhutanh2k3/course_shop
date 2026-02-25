import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiShield, FiShoppingCart, FiCheckCircle, FiHardDrive, FiUnlock, FiPlayCircle, FiMessageCircle, FiHeart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { fetchCourseBySlug } from '../slices/courseSlice';
import { addToCart } from '../slices/cartSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function CourseDetail() {
    const { slug } = useParams<{ slug: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { currentCourse: course, loading, error } = useSelector((state: RootState) => state.courses);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);

    useEffect(() => {
        if (slug) {
            dispatch(fetchCourseBySlug(slug));
        }
    }, [dispatch, slug]);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (isAuthenticated && course) {
                try {
                    const response = await api.get(`/wishlist/check/${course.id}`);
                    setIsWishlisted(response.data.is_wishlisted);
                } catch (error) {
                    console.error("Lỗi kiểm tra wishlist", error);
                }
            }
        };
        checkWishlistStatus();
    }, [isAuthenticated, course]);

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để lưu khóa học');
            navigate('/login');
            return;
        }

        if (!course) return;

        try {
            setTogglingWishlist(true);
            const response = await api.post('/wishlist/toggle', { course_id: course.id });
            setIsWishlisted(response.data.is_wishlisted);
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setTogglingWishlist(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );
    if (error) return <div className="text-center py-20 text-red-500 font-medium bg-gray-50 min-h-screen pt-32">{error}</div>;
    if (!course) return <div className="text-center py-20 text-gray-500 bg-gray-50 min-h-screen pt-32">Không tìm thấy tài liệu này.</div>;

    const handleAddToCart = () => {
        dispatch(addToCart(course));
        toast.success('Đã thêm vào giỏ hàng');
    };

    const handleCheckout = () => {
        dispatch(addToCart(course));
        navigate('/cart');
    };

    const originalPrice = Number(course.original_price) || 0;
    const price = Number(course.discounted_price) || 0;
    const hasDiscount = originalPrice > price;
    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900 z-0"></div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>

                <div className="container mx-auto px-4 pt-8 md:pt-10 pb-16 md:pb-24 relative z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/80 text-white text-sm font-medium backdrop-blur-sm border border-slate-700/50 transition-all hover:pr-5 shadow-sm group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
                    </button>
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-3 backdrop-blur-sm border border-blue-500/30">
                            <FiHardDrive /> Tài liệu Google Drive
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight tracking-tight text-white group">
                            {course.title || 'Kho tài liệu chưa đặt tên'}
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base mb-5 leading-relaxed max-w-2xl font-light">
                            Tải trọn bộ video bài giảng, tài liệu PDF, bài tập thực hành gốc. Thanh toán 1 lần - Sở hữu vĩnh viễn trên tài khoản Google Drive của bạn.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-slate-700/50">
                                <FiUnlock className="text-blue-400" /> <span>Học trọn đời</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-slate-700/50">
                                <FiPlayCircle className="text-green-400" /> <span>Video gốc HD</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-slate-700/50">
                                <FiCheckCircle className="text-yellow-400" /> <span>Kích hoạt tự động</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 md:-mt-16 relative z-30">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

                    {/* Left Column: Image & Content */}
                    <div className="flex-1 space-y-8">
                        {/* Featured Image */}
                        <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-100/50 aspect-video overflow-hidden group">
                            <img
                                src={course.image_url}
                                alt={course.title}
                                className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        {/* Description Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
                            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <FiMessageCircle className="text-blue-500" /> Giới thiệu chi tiết
                            </h2>
                            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl">
                                {course.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: course.description }} />
                                ) : (
                                    <p className="text-slate-500 italic">Chưa có thông tin mô tả chi tiết cho bộ tài liệu này.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Checkout Sticky Card */}
                    <div className="w-full lg:w-[360px]">
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-6 sticky top-24">

                            {/* Price Section */}
                            <div className="text-center mb-5 border-b border-slate-100 pb-5">
                                <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mb-2">Đầu tư một lần</div>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {new Intl.NumberFormat('vi-VN').format(price)}<span className="text-xl text-slate-500 ml-1">đ</span>
                                    </span>
                                </div>

                                {hasDiscount && (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-base text-red-500 line-through decoration-red-300 font-medium">
                                            {new Intl.NumberFormat('vi-VN').format(originalPrice)}đ
                                        </span>
                                        <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-100">
                                            Tiết kiệm {discountPercent}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    Thanh toán ngay <span className="font-normal opacity-80">&rarr;</span>
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors text-sm"
                                    >
                                        <FiShoppingCart className="text-base text-slate-400" /> Thêm vào giỏ
                                    </button>
                                    <button
                                        onClick={handleToggleWishlist}
                                        disabled={togglingWishlist}
                                        className={`w-12 flex items-center justify-center rounded-xl border transition-colors ${isWishlisted
                                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-red-500'
                                            }`}
                                        title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                                    >
                                        <FiHeart className={`text-lg ${isWishlisted ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3">
                                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                                        <FiHardDrive className="text-base" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block mb-0.5">Link Google Drive Trực Tiếp</span>
                                        <span className="text-slate-500 leading-relaxed">Không qua trung gian, tốc độ tải tối đa.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5 shrink-0">
                                        <FiShield className="text-base" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block mb-0.5">Bảo Hành Vĩnh Viễn</span>
                                        <span className="text-slate-500 leading-relaxed">Cam kết link sống 100%.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-0.5 shrink-0">
                                        <FiClock className="text-base" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block mb-0.5">Nhận Link Tức Thì</span>
                                        <span className="text-slate-500 leading-relaxed">Hệ thống mở khóa Google Drive tự động.</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
