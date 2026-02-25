import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../../../slices/categorySlice';
import { addCourse, updateCourse, fetchCourseBySlug, clearCurrentCourse, type Course } from '../../../slices/courseSlice';
import type { AppDispatch, RootState } from '../../../redux/store';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiImage, FiHardDrive, FiType, FiTag, FiDollarSign, FiPercent, FiUser, FiInfo } from 'react-icons/fi';
import SimpleRichTextEditor from '../../../components/courses/SimpleRichTextEditor';

export default function CourseForm() {
    const { slug } = useParams();
    const isEditMode = !!slug;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { categories } = useSelector((state: RootState) => state.categories);
    const { currentCourse, loading, error } = useSelector((state: RootState) => state.courses);

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<Partial<Course>>({
        title: '',
        description: '',
        instructor: 'KhoKhoaHoc',
        original_price: 0,
        discounted_price: 0,
        image_url: '',
        category_id: undefined,
        is_published: 1,
        download_file_path: '',
        download_file_name: 'Link tải Google Drive'
    });

    useEffect(() => {
        dispatch(fetchCategories());

        if (isEditMode && slug) {
            dispatch(fetchCourseBySlug(slug));
        } else {
            dispatch(clearCurrentCourse());
            setFormData({
                title: '',
                description: '',
                instructor: 'KhoKhoaHoc',
                original_price: 0,
                discounted_price: 0,
                category_id: undefined,
                image_url: '',
                download_file_path: '',
                download_file_name: 'Link Google Drive',
                is_published: 1,
            });
        }
    }, [dispatch, slug, isEditMode]);

    useEffect(() => {
        if (isEditMode && currentCourse) {
            setFormData({
                title: currentCourse.title,
                description: currentCourse.description || '',
                instructor: currentCourse.instructor || 'KhoKhoaHoc',
                original_price: currentCourse.original_price,
                discounted_price: currentCourse.discounted_price,
                category_id: currentCourse.category_id,
                image_url: currentCourse.image_url || '',
                download_file_path: currentCourse.download_file_path || '',
                download_file_name: currentCourse.download_file_name || 'Link Google Drive',
                is_published: currentCourse.is_published ? 1 : 0,
            });
        }
    }, [currentCourse, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<Course>) => ({
            ...prev,
            [name]: name === 'is_published' ? parseInt(value) : value,
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image_url: previewUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Đang xử lý...');

        const submissionData = new FormData();
        submissionData.append('title', formData.title || '');
        submissionData.append('description', formData.description || '');
        submissionData.append('instructor', formData.instructor || 'KhoKhoaHoc');
        submissionData.append('original_price', String(formData.original_price || 0));
        submissionData.append('discounted_price', String(formData.discounted_price || 0));
        if (formData.category_id) submissionData.append('category_id', String(formData.category_id));
        submissionData.append('is_published', formData.is_published ? '1' : '0');
        submissionData.append('download_file_path', formData.download_file_path || '');
        submissionData.append('download_file_name', formData.download_file_name || 'Link Google Drive');

        if (imageFile) {
            submissionData.append('image', imageFile);
        } else if (formData.image_url) {
            submissionData.append('image_url', formData.image_url);
        }

        try {
            if (isEditMode && currentCourse) {
                await dispatch(updateCourse({ id: currentCourse.id, data: submissionData })).unwrap();
                toast.success('Cập nhật tài liệu thành công!', { id: toastId });
            } else {
                await dispatch(addCourse(submissionData)).unwrap();
                toast.success('Thêm tài liệu mới thành công!', { id: toastId });
            }
            navigate('/admin/courses');
        } catch (err: any) {
            toast.error(err || 'Có lỗi xảy ra', { id: toastId });
        }
    };

    if (loading && isEditMode && !currentCourse) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách
                </button>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {isEditMode ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
                </h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
                {error && <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"><FiInfo className="text-xl shrink-0" /> {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <FiInfo className="text-blue-500" /> Thông tin cơ bản
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FiType className="text-slate-400" /> Tên tài liệu / Khóa học</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    required
                                    placeholder="Vd: Khóa học Master UI/UX Design..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FiTag className="text-slate-400" /> Danh mục</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id || ''}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                                    required
                                >
                                    <option value="" disabled>Chọn danh mục phù hợp</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FiUser className="text-slate-400" /> Nguồn gốc / Tác giả</label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <FiDollarSign className="text-green-500" /> Thiết lập giá bán
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FiDollarSign className="text-slate-400" /> Giá gốc (VNĐ)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="original_price"
                                        value={formData.original_price}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                        min="0"
                                        required
                                    />
                                    <span className="absolute right-4 top-2.5 text-slate-400 font-medium">VNĐ</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FiPercent className="text-slate-400" /> Giá khuyến mãi (VNĐ)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="discounted_price"
                                        value={formData.discounted_price}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-bold text-blue-600"
                                        min="0"
                                        required
                                    />
                                    <span className="absolute right-4 top-2.5 text-slate-400 font-medium">VNĐ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media & Delivery Section */}
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                            <FiHardDrive className="text-blue-600" /> File kỹ thuật số (Sản phẩm)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-1 border-r border-blue-200 pr-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><FiImage className="text-slate-400" /> Ảnh bìa (Thumbnail)</label>

                                <div className="flex flex-col gap-4 items-start">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Preview" className="h-32 w-full object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                                    ) : (
                                        <div className="h-32 w-full bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 text-slate-400">
                                            <FiImage className="text-3xl mb-2 opacity-50" />
                                            <span className="text-xs font-medium">Chưa có ảnh</span>
                                        </div>
                                    )}
                                    <div className="relative w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <FiImage /> Chọn ảnh từ máy
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <FiHardDrive className="text-blue-600" /> Link tải tài liệu (Google Drive)
                                </label>
                                <input
                                    type="url"
                                    name="download_file_path"
                                    value={formData.download_file_path || ''}
                                    onChange={handleChange}
                                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-inner font-medium text-slate-800 placeholder-slate-400"
                                    placeholder="Dán link thư mục Google Drive vào đây..."
                                    required
                                />
                                <div className="mt-3 p-3 bg-blue-100/50 rounded-lg text-xs leading-relaxed text-blue-800 border border-blue-200">
                                    <strong>Quan trọng:</strong> Đây là sản phẩm khách hàng sẽ nhận được sau khi thanh toán. Hãy chắc chắn link đã được <strong>cấp quyền truy cập</strong> (Bất kỳ ai có liên kết) hoặc chia sẻ quyền tự động qua hệ thống.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả chi tiết (Bài viết bán tài liệu)</label>
                        <SimpleRichTextEditor
                            value={formData.description || ''}
                            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                            placeholder="Nhập giới thiệu chi tiết về tài liệu, khóa học. Nhấn mạnh điểm nổi bật, danh sách các file..."
                            className="w-full h-80"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-slate-700">Trạng thái hiển thị:</label>
                            <select
                                name="is_published"
                                value={formData.is_published}
                                onChange={handleChange}
                                className="border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium text-slate-700"
                            >
                                <option value={1}>Công khai (Đang bán)</option>
                                <option value={0}>Nháp (Ẩn)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                        >
                            <FiSave className="text-lg" /> {isEditMode ? 'Cập nhật tài liệu' : 'Đăng bán tài liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
