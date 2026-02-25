import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    instructor: string;
    original_price: number;
    discounted_price: number;
    image_url: string | null;
    category: { id: number; name: string } | null;
}

export default function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wishlist');
            setWishlist(response.data.data);
        } catch (error) {
            toast.error('Không thể tải danh sách khóa học yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (courseId: number, courseTitle: string) => {
        try {
            await api.post('/wishlist/toggle', { course_id: courseId });
            setWishlist(wishlist.filter(course => course.id !== courseId));
            toast.success(`Đã xóa ${courseTitle} khỏi danh sách yêu thích`);
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors group text-sm"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
                </button>
                <div className="flex items-center mb-6">
                    <FiHeart className="text-red-500 text-2xl mr-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Khóa học yêu thích</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FiHeart className="text-gray-300 text-3xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Danh sách trống</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                            Bạn chưa thêm khóa học nào vào danh sách yêu thích. Hãy khám phá các khóa học và lưu lại những khóa bạn quan tâm nhé!
                        </p>
                        <Link
                            to="/courses"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            Khám phá khóa học
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100 relative group">
                                <button
                                    onClick={() => handleRemove(course.id, course.title)}
                                    className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                    title="Bỏ yêu thích"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                                <Link to={`/courses/${course.slug}`} className="flex-grow">
                                    <div className="relative h-40 w-full bg-gray-200">
                                        {course.image_url ? (
                                            <img
                                                src={course.image_url.startsWith('http') ? course.image_url : `${import.meta.env.VITE_API_BASE_URL}/storage/${course.image_url}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        {course.category && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm text-xs font-semibold rounded-full text-primary">
                                                    {course.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs mb-3">{course.instructor}</p>
                                        <div className="flex items-end space-x-2 mt-auto">
                                            <span className="text-xl font-bold text-primary">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discounted_price)}
                                            </span>
                                            {course.original_price > course.discounted_price && (
                                                <span className="text-xs text-gray-400 line-through mb-1">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.original_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
