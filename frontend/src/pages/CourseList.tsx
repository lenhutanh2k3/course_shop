import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiSearch, FiX, FiFolder, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../slices/courseSlice';
import { fetchCategories } from '../slices/categorySlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function CourseList() {
    const dispatch = useDispatch<AppDispatch>();
    const { courses, loading: coursesLoading, pagination } = useSelector((state: RootState) => state.courses);
    const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);

    const [selectedCategorySlug, setSelectedCategorySlug] = useState("all");
    const [selectedPriceRange, setSelectedPriceRange] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        // Reset page to 1 when search, category, price_range, or sort changes
        setCurrentPage(1);
    }, [searchQuery, selectedCategorySlug, selectedPriceRange, sortOption]);

    useEffect(() => {
        const params: Record<string, string | number> = {
            page: currentPage,
            sort: sortOption
        };
        if (selectedCategorySlug !== "all") {
            params.category_slug = selectedCategorySlug;
        }
        if (selectedPriceRange !== "all") {
            params.price_range = selectedPriceRange;
        }
        if (searchQuery) {
            params.search = searchQuery;
        }

        const timeoutId = setTimeout(() => {
            dispatch(fetchCourses(params));
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [dispatch, selectedCategorySlug, selectedPriceRange, searchQuery, sortOption, currentPage]);

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Storefront Header */}
            <div className="bg-slate-900 border-b border-slate-800">
                <div className="container mx-auto px-4 py-8 md:py-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                        Kho Tài Liệu <span className="text-blue-400">Cao Cấp</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-base">
                        Khám phá thư viện tài liệu đồ sộ, cập nhật liên tục. Mua 1 lần, sở hữu và tải xuống vĩnh viễn qua Google Drive.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Search & Mobile Filter Row */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <div className="relative w-full md:w-80 flex-grow-0">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu, khóa học..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 w-full text-slate-700 text-sm font-medium placeholder-slate-400 transition-shadow"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FiSearch className="absolute left-4 top-3 text-slate-400" />
                    </div>

                    <div className="flex w-full md:w-auto px-2 gap-2">
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 outline-none font-medium cursor-pointer"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="latest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                            <option value="discount_desc">Khuyến mãi nhiều</option>
                        </select>

                        <button
                            className="md:hidden w-full bg-slate-100 py-2 rounded-xl text-slate-600 font-medium flex items-center justify-center gap-2 border border-slate-200 text-sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter /> Lọc
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <aside className={`md:w-60 lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                            <div className="flex justify-between items-center mb-6 md:hidden">
                                <h3 className="font-bold text-lg text-slate-800">Danh mục tài liệu</h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-100 rounded-lg text-slate-500"><FiX /></button>
                            </div>

                            <div>
                                <h3 className="font-extrabold text-slate-900 mb-4 text-base uppercase tracking-wider hidden md:flex items-center gap-2">
                                    <FiFolder className="text-blue-500" /> Danh mục
                                </h3>
                                <div className="space-y-1.5 list-none">
                                    <label className="flex items-center cursor-pointer group rounded-lg p-2 hover:bg-slate-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="all"
                                            checked={selectedCategorySlug === "all"}
                                            onChange={() => setSelectedCategorySlug("all")}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border border-slate-300 mr-3 flex items-center justify-center transition-colors ${selectedCategorySlug === "all" ? 'border-blue-500' : 'group-hover:border-blue-400'}`}>
                                            {selectedCategorySlug === "all" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <span className={`text-slate-600 font-medium transition-colors ${selectedCategorySlug === "all" ? 'text-blue-600' : 'group-hover:text-slate-900'}`}>
                                            Tất cả tài liệu
                                        </span>
                                    </label>

                                    {categoriesLoading ? (
                                        <div className="p-4 text-center text-sm text-slate-400">Đang tải...</div>
                                    ) : (
                                        categories.map(category => (
                                            <label key={category.id} className="flex items-center cursor-pointer group rounded-lg p-2 hover:bg-slate-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={category.slug}
                                                    checked={selectedCategorySlug === category.slug}
                                                    onChange={() => setSelectedCategorySlug(category.slug)}
                                                    className="hidden"
                                                />
                                                <div className={`w-4 h-4 rounded-full border border-slate-300 mr-3 flex items-center justify-center transition-colors ${selectedCategorySlug === category.slug ? 'border-blue-500' : 'group-hover:border-blue-400'}`}>
                                                    {selectedCategorySlug === category.slug && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                                </div>
                                                <span className={`text-slate-600 font-medium transition-colors ${selectedCategorySlug === category.slug ? 'text-blue-600' : 'group-hover:text-slate-900'}`}>
                                                    {category.name}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Filter Giá */}
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <h3 className="font-extrabold text-slate-900 mb-4 text-base uppercase tracking-wider hidden md:flex items-center gap-2">
                                    <FiFilter className="text-blue-500" /> Lọc theo giá
                                </h3>
                                <div className="space-y-1.5 list-none">
                                    {[
                                        { value: 'all', label: 'Tất cả các giá' },
                                        { value: 'free', label: 'Miễn phí' },
                                        { value: 'under_100k', label: 'Dưới 100.000đ' },
                                        { value: '100k_500k', label: 'Từ 100k - 500k' },
                                        { value: '500k_1m', label: 'Từ 500k - 1 Triệu' },
                                        { value: 'over_1m', label: 'Trên 1 Triệu' },
                                    ].map(range => (
                                        <label key={range.value} className="flex items-center cursor-pointer group rounded-lg p-2 hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                value={range.value}
                                                checked={selectedPriceRange === range.value}
                                                onChange={() => setSelectedPriceRange(range.value)}
                                                className="hidden"
                                            />
                                            <div className={`w-4 h-4 rounded-full border border-slate-300 mr-3 flex items-center justify-center transition-colors ${selectedPriceRange === range.value ? 'border-blue-500' : 'group-hover:border-blue-400'}`}>
                                                {selectedPriceRange === range.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <span className={`text-slate-600 font-medium transition-colors ${selectedPriceRange === range.value ? 'text-blue-600' : 'group-hover:text-slate-900'}`}>
                                                {range.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Course Grid */}
                    <div className="flex-1">
                        {coursesLoading ? (
                            <div className="flex justify-center py-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiSearch className="text-3xl text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy tài liệu này</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.</p>
                                <button
                                    onClick={() => { setSelectedCategorySlug("all"); setSelectedPriceRange("all"); setSearchQuery(""); }}
                                    className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                                >
                                    Xem tất cả tài liệu
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {!coursesLoading && pagination && pagination.last_page > 1 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <nav className="inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-4 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>

                            {[...Array(pagination.last_page)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={currentPage === pagination.last_page}
                                className={`relative inline-flex items-center px-4 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium ${currentPage === pagination.last_page ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}
