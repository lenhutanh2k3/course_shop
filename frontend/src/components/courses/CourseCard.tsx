import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHardDrive } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../slices/cartSlice';
import toast from 'react-hot-toast';
import type { Course } from '../../slices/courseSlice';
import type { AppDispatch } from '../../redux/store';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    const dispatch = useDispatch<AppDispatch>();
    const originalPrice = Number(course.original_price) || 0;
    const price = Number(course.discounted_price) || 0;
    const hasDiscount = originalPrice > price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(addToCart(course));
        toast.success('Đã thêm vào giỏ hàng!');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full group">
            {/* Thumbnail */}
            <Link to={`/courses/${course.slug}`} className="relative block overflow-hidden aspect-video bg-slate-50">
                <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {course.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-white/20">
                        {course.category.name}
                    </span>
                )}

                {hasDiscount && (
                    <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-red-500/20">
                        -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                    </span>
                )}

                {/* Overlay Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        <FiHardDrive className="text-2xl" />
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col relative bg-white">
                <Link to={`/courses/${course.slug}`} className="block mb-2 group-hover:text-blue-600 transition-colors">
                    <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[3rem] text-lg leading-snug">
                        {course.title}
                    </h3>
                </Link>

                <div className="text-sm text-slate-500 mb-5 line-clamp-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                    {course.instructor || 'Tài liệu độc quyền'}
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <div className="mb-1">
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                                    Giảm {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                                </span>
                            </div>
                        )}
                        <span className="font-extrabold text-xl text-blue-600 leading-none mb-1.5 tracking-tight">
                            {new Intl.NumberFormat('vi-VN').format(price)}<span className="text-sm text-blue-500 ml-0.5 font-semibold">đ</span>
                        </span>
                        {originalPrice > 0 && (
                            <span className={`text-xs font-medium ${hasDiscount ? 'text-red-500 line-through' : 'text-slate-500'}`}>
                                {new Intl.NumberFormat('vi-VN').format(originalPrice)}đ
                            </span>
                        )}
                        {originalPrice === 0 && !hasDiscount && <span className="h-4"></span>}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 flex items-center justify-center flex-shrink-0 border border-slate-100 hover:border-blue-600"
                        title="Thêm vào giỏ"
                    >
                        <FiShoppingCart className="text-[1.1rem]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
