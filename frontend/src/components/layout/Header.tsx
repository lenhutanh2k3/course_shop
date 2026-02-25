import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiSearch, FiHeart, FiClock } from 'react-icons/fi';

export default function Header() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const { items } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch<AppDispatch>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 relative">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">{import.meta.env.VITE_APP_NAME}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex items-center space-x-5">
                            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">Trang chủ</Link>
                            <Link to="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">Khóa học</Link>
                            <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">Liên hệ</Link>
                        </nav>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm khóa học..."
                                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:border-blue-500 w-56 transition cursor-not-allowed opacity-70"
                                disabled // Disabled for now until functionality is added
                            />
                            <FiSearch className="absolute left-3 top-2 text-gray-400 text-sm" />
                        </div>

                        {/* Cart */}
                        <div className="flex items-center space-x-4">
                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition block">
                                <FiShoppingCart className="text-xl" />
                                {items.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{items.length}</span>
                                )}
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <div className="relative group">
                                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none">
                                            <img
                                                src={user?.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="font-medium truncate max-w-[100px]">{user?.name}</span>
                                        </button>
                                        {/* Dropdown */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                                <FiUser className="mr-3" />
                                                Hồ sơ cá nhân
                                            </Link>
                                            <Link to="/wishlist" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                <FiHeart className="mr-3" />
                                                Khóa học yêu thích
                                            </Link>
                                            <Link to="/orders" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                <FiClock className="mr-3" />
                                                Lịch sử đơn hàng
                                            </Link>
                                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                                                <FiLogOut className="mr-2" /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-full font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button - Also add Cart to Mobile Navbar */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition block">
                            <FiShoppingCart className="text-xl" />
                            {items.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{items.length}</span>
                            )}
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none">
                            {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                        </button>
                    </div>


                    {/* Mobile Menu */}
                    {
                        isMenuOpen && (
                            <div className="md:hidden absolute w-full left-0 top-full bg-white border-t border-gray-100 py-4 shadow-xl z-50">
                                <div className="container mx-auto px-4 space-y-4">
                                    <Link to="/" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
                                    <Link to="/courses" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Khóa học</Link>
                                    <Link to="/contact" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link>
                                    <Link to="/cart" className="block text-gray-600 hover:text-blue-600 font-medium flex items-center" onClick={() => setIsMenuOpen(false)}>
                                        <FiShoppingCart className="mr-2" /> Giỏ hàng
                                    </Link>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/profile" className="block text-gray-600 hover:text-blue-600 font-medium flex items-center" onClick={() => setIsMenuOpen(false)}>
                                                <FiUser className="mr-2" /> Hồ sơ cá nhân
                                            </Link>
                                            <Link to="/orders" className="block text-gray-600 hover:text-blue-600 font-medium flex items-center" onClick={() => setIsMenuOpen(false)}>
                                                <FiShoppingCart className="mr-2" /> Lịch sử đơn hàng
                                            </Link>
                                            <button onClick={handleLogout} className="block w-full text-left text-red-600 font-medium flex items-center">
                                                <FiLogOut className="mr-2" /> Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col space-y-3">
                                            <Link to="/login" className="block text-center text-gray-600 border border-gray-300 py-2 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                                            <Link to="/register" className="block text-center bg-blue-600 text-white py-2 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Đăng ký</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </header>
    );
}
