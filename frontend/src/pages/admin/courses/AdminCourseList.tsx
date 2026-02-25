import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit, FiTrash, FiPlus, FiRefreshCcw, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchAdminCourses, fetchTrashedCourses, deleteCourse, restoreCourse, forceDeleteCourse } from '../../../slices/courseSlice';
import { fetchCategories } from '../../../slices/categorySlice';
import type { AppDispatch, RootState } from '../../../redux/store';
import { Link } from 'react-router-dom';

export default function AdminCourseList() {
    const dispatch = useDispatch<AppDispatch>();
    const { courses, loading, error } = useSelector((state: RootState) => state.courses);
    const { categories } = useSelector((state: RootState) => state.categories);

    const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

    // Filtering and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'active') {
            dispatch(fetchAdminCourses());
        } else {
            dispatch(fetchTrashedCourses());
        }
    }, [dispatch, activeTab]);

    // Apply filters
    const filteredCourses = courses.filter(course => {
        const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === 'all' || course.category_id?.toString() === filterCategory;
        const matchStatus = filterStatus === 'all' ||
            (filterStatus === 'published' && course.is_published) ||
            (filterStatus === 'draft' && !course.is_published);
        return matchSearch && matchCategory && matchStatus;
    });

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterStatus, activeTab]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setFilterStatus('all');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này vào thùng rác?')) {
            try {
                await dispatch(deleteCourse(id)).unwrap();
                toast.success('Đã chuyển vào thùng rác');
                dispatch(fetchAdminCourses());
            } catch (err: any) {
                toast.error(err?.message || err || 'Lỗi khi xóa khóa học');
            }
        }
    };

    const handleRestore = async (id: number) => {
        if (window.confirm('Khôi phục khóa học này?')) {
            try {
                await dispatch(restoreCourse(id)).unwrap();
                toast.success('Khôi phục thành công');
                dispatch(fetchTrashedCourses());
            } catch (err: any) {
                toast.error(err?.message || err || 'Lỗi khi khôi phục');
            }
        }
    };

    const handleForceDelete = async (id: number) => {
        if (window.confirm('Xóa VĨNH VIỄN khóa học này? Hành động này không thể hoàn tác!')) {
            try {
                await dispatch(forceDeleteCourse(id)).unwrap();
                toast.success('Đã xóa vĩnh viễn khóa học');
                dispatch(fetchTrashedCourses());
            } catch (err: any) {
                toast.error(err?.message || err || 'Lỗi khi xóa vĩnh viễn');
            }
        }
    };

    if (loading && courses.length === 0) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
                <Link
                    to="/admin/courses/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <FiPlus /> Thêm khóa học
                </Link>
            </div>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`py-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Tất cả khóa học
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={`py-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'trash' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Thùng rác
                </button>
            </div>

            {/* Toolbar: Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Công khai</option>
                        <option value="draft">Nháp</option>
                    </select>
                </div>
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
                >
                    Xóa lọc
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 w-16 text-center">STT</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Hình ảnh</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tên khóa học</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Danh mục</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">Giá</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center whitespace-nowrap">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-center whitespace-nowrap">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedCourses.map((course, index) => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <img src={course.image_url} alt={course.title} className="w-16 h-10 object-cover rounded" />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="max-w-xs truncate" title={course.title}>{course.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{course.category?.name || '---'}</td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discounted_price)}
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {course.is_published ? 'Công khai' : 'Nháp'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {activeTab === 'active' ? (
                                                <>
                                                    <Link
                                                        to={`/admin/courses/${course.slug}/edit`}
                                                        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded transition"
                                                        title="Sửa"
                                                    >
                                                        <FiEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(course.id)}
                                                        className="inline-flex items-center justify-center text-red-600 hover:text-red-800 p-2 bg-red-50 rounded transition"
                                                        title="Xóa vào thùng rác"
                                                    >
                                                        <FiTrash />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleRestore(course.id)}
                                                        className="inline-flex items-center justify-center text-green-600 hover:text-green-800 p-2 bg-green-50 rounded transition"
                                                        title="Khôi phục"
                                                    >
                                                        <FiRefreshCcw />
                                                    </button>
                                                    <button
                                                        onClick={() => handleForceDelete(course.id)}
                                                        className="inline-flex items-center justify-center text-orange-600 hover:text-orange-800 p-2 bg-orange-50 rounded transition"
                                                        title="Xóa vĩnh viễn"
                                                    >
                                                        <FiAlertTriangle />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && courses.length > 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        Không có khóa học nào khớp với bộ lọc.
                                    </td>
                                </tr>
                            )}
                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        {activeTab === 'active' ? 'Chưa có khóa học nào.' : 'Thùng rác trống.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="text-sm text-gray-500 font-medium">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCourses.length)} trong tổng số {filteredCourses.length} khóa học
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
                        >
                            Trang trước
                        </button>
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${currentPage === idx + 1
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
