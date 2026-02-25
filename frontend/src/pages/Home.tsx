import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiBookOpen, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import CourseCard from '../components/courses/CourseCard';
import { fetchFeaturedCourses, fetchCourses } from '../slices/courseSlice';
import { fetchCategories } from '../slices/categorySlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { featuredCourses, loading } = useSelector((state: RootState) => state.courses);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { courses } = useSelector((state: RootState) => state.courses);

  const programmingCourses = courses.filter(c => c.category?.slug === 'lap-trinh');
  const tiktokCourses = courses.filter(c => c.category?.slug === 'tiktok');
  const englishCourses = courses.filter(c => c.category?.slug === 'tieng-anh');

  const CategoryCarousel = ({ title, description, slug, courses }: { title: string, description: string, slug: string, courses: any[] }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(true);

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -350 : 350;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    useEffect(() => {
      handleScroll();
      window.addEventListener('resize', handleScroll);
      return () => window.removeEventListener('resize', handleScroll);
    }, [courses]);

    return (
      <div className="relative group">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{description}</p>
          </div>
          <Link to={`/courses?category=${slug}`} className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center mb-1">
            Xem tất cả <FiArrowRight className="ml-1" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="relative">
            {/* Left Button */}
            <button
              onClick={() => scroll('left')}
              className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${!showLeftBtn ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <FiChevronLeft className="text-2xl" />
            </button>

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-4 px-2 -mx-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {courses.map((course, idx) => (
                <div key={course.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={() => scroll('right')}
              className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${!showRightBtn ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <FiChevronRight className="text-2xl" />
            </button>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">Chưa có khóa học nào cho danh mục này.</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    dispatch(fetchFeaturedCourses());
    dispatch(fetchCategories());
    dispatch(fetchCourses({ per_page: 50 })); // Fetch more to ensure we have enough for categories
  }, [dispatch]);

  return (
    <div className="space-y-10 pb-12 bg-gray-50 pt-6">

      {/* Hero Section */}
      <section className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-1/4 hidden lg:block">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-t-xl p-4 text-white font-bold text-center tracking-wide">
            DANH MỤC TÀI LIỆU
          </div>
          <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden flex flex-col shadow-sm divide-y divide-gray-50">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} to={`/courses?category=${cat.slug}`} className="px-5 py-3.5 hover:bg-blue-50/50 hover:pl-6 hover:text-blue-700 transition-all duration-200 text-sm font-medium text-gray-700 flex items-center justify-between group">
                {cat.name}
                <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              </Link>
            ))}
            <Link to="/courses" className="px-5 py-3 hover:bg-gray-100 transition text-sm font-bold text-blue-600 bg-gray-50/80 text-center">
              Xem tất cả...
            </Link>
          </div>
        </div>

        {/* Right Banner */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-2xl h-full flex flex-col justify-center border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-indigo-50/20 rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>

            <div className="relative z-10 p-6 lg:p-10 max-w-xl">
              <div className="inline-block bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm mb-4">
                Kho Tài Liệu Số Lớn Nhất
              </div>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Không giới hạn kiến thức<br />
                <span className="text-blue-600">tầm tay của bạn</span>
              </h1>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                Khám phá kho lưu trữ khóa học trực tuyến khổng lồ, được chọn lọc kỹ càng từ các chuyên gia hàng đầu. Sở hữu vĩnh viễn, truy cập mọi lúc qua Google Drive tốc độ chuẩn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-200">
                  Khám Phá Ngay <FiArrowRight />
                </Link>
                <div className="inline-flex items-center gap-2 text-gray-600 font-medium px-4">
                  <FiCheckCircle className="text-green-500 text-xl" /> Cập nhật liên tục
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-8 -bottom-8 text-blue-50/50 transform rotate-[-15deg] pointer-events-none">
              <FiBookOpen size={280} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="container mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <FiCheckCircle className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chất lượng tuyển chọn</h3>
              <p className="text-gray-500 leading-relaxed">Video độ phân giải cao cùng đầy đủ tài liệu đi kèm giống 100% mô tả.</p>
            </div>
            <div className="text-center px-4 border-y border-gray-100 py-8 md:py-0 md:border-y-0 md:border-x">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3">
                <FiBookOpen className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lưu trữ linh hoạt</h3>
              <p className="text-gray-500 leading-relaxed">Nhận link Google Drive ngay sau 1 chạm. Truy cập xem bài giảng trọn đời.</p>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <FiCheckCircle className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tối ưu chi phí</h3>
              <p className="text-gray-500 leading-relaxed">Đồng giá siêu hấp dẫn chỉ từ 99k/Khóa cho mọi kiến thức bạn cần.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Khóa học nổi bật</h2>
            <p className="text-gray-500 text-sm sm:text-base">Những nội dung được học viên săn đón nhiều nhất tuần qua.</p>
          </div>
          <Link to="/courses" className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center group mb-1 mt-2 sm:mt-0">
            Xem tất cả <FiArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              Đang tải sản phẩm
            </div>
          ) : featuredCourses.length > 0 ? (
            featuredCourses.map((course, idx) => (
              <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <CourseCard course={course} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100">Chưa có khóa học nổi bật nào.</div>
          )}
        </div>
        <div className="space-y-16 mt-16 w-full max-w-7xl mx-auto">
          {/* Tiếng Anh Section */}
          <CategoryCarousel
            title="Tiếng Anh"
            description="Chinh phục IELTS, TOEIC và giao tiếp tự tin mỗi ngày."
            slug="tieng-anh"
            courses={englishCourses}
          />

          {/* Lập trình Section */}
          <CategoryCarousel
            title="Lập trình"
            description="Nâng cao kỹ năng code với các khóa học chất lượng."
            slug="lap-trinh"
            courses={programmingCourses}
          />

          {/* Tiktok Section */}
          <CategoryCarousel
            title="Tiktok"
            description="Bí quyết xây kênh và bán hàng ngàn đơn trên Tiktok."
            slug="tiktok"
            courses={tiktokCourses}
          />
        </div>
      </section>
    </div>
  );
}