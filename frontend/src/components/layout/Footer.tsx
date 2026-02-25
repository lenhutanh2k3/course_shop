import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { FiBookOpen } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 text-gray-300">
            {/* Main Footer Container */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-6">

                    {/* Column 1: Brand & Intro */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2 text-white">
                            <FiBookOpen className="h-8 w-8 text-blue-500" />
                            <span className="font-bold text-2xl tracking-tight">{import.meta.env.VITE_APP_NAME}</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Nền tảng học tập trực tuyến hàng đầu cung cấp kiến thức thực tiễn từ các chuyên gia. Nâng tầm kỹ năng của bạn mọi lúc, mọi nơi.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300"><FaFacebook size={18} /></a>
                            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 hover:text-white transition-colors duration-300"><FaTwitter size={18} /></a>
                            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-colors duration-300"><FaInstagram size={18} /></a>
                            <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300"><FaYoutube size={18} /></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                            <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                            Khám phá
                        </h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Trang chủ</Link></li>
                            <li><Link to="/courses" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Khóa học</Link></li>
                            <li><Link to="/blog" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Blog cập nhật</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Về chúng tôi</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal & Support */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                            <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                            Hỗ trợ
                        </h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/faq" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Câu hỏi thường gặp</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Điều khoản dịch vụ</Link></li>
                            <li><Link to="/privacy" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Chính sách bảo mật</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400 transition-colors flex items-center group"><span className="mr-2 group-hover:translate-x-1 transition-transform">›</span> Liên hệ hợp tác</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
                            <span className="w-1 h-5 bg-blue-500 mr-3 rounded"></span>
                            Liên hệ
                        </h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start">
                                <FaMapMarkerAlt className="mt-1.5 mr-3 text-blue-500 flex-shrink-0" />
                                <span>Tầng 5, Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP. HCM</span>
                            </li>
                            <li className="flex items-center">
                                <FaPhoneAlt className="mr-3 text-blue-500 flex-shrink-0" />
                                <span>+84 123 456 789</span>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="mr-3 text-blue-500 flex-shrink-0" />
                                <span>support@khokhoahoc.com</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} KhoKhoaHoc. Đã đăng ký bản quyền.</p>
                    <div className="mt-4 md:mt-0 flex space-x-6 relative z-10">
                        <Link to="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
