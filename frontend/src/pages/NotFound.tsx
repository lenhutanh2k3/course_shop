import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="relative mb-8">
                <h1 className="text-9xl font-extrabold text-blue-600/20 tracking-widest">404</h1>
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-900">
                    Oops!
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                Trang bạn tìm kiếm không tồn tại
            </h2>

            <p className="text-gray-500 max-w-md mb-8">
                Có vẻ như trang này đã bị xóa, thay đổi đường dẫn hoặc tạm thời không truy cập được.
                Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <FiArrowLeft /> Quay lại
                </button>
                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <FiHome /> Về trang chủ
                </Link>
            </div>
        </div>
    );
}
