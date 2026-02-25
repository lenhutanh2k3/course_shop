import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCamera, FiSave, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import { updateProfileSuccess } from '../slices/authSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [name, setName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state if user changes (e.g., initial load)
    useEffect(() => {
        if (user) {
            setName(user.name);
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setStatus('error');
                setMessage('Kích thước ảnh không được vượt quá 2MB');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setStatus('idle');
            setMessage('');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setStatus('error');
            setMessage('Tên không được để trống');
            return;
        }

        setStatus('loading');

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            // Laravel expects POST or PUT. When sending files, it's often easier to POST with _method=PUT, 
            // but we created a POST route `/profile` in api.php, so POST is perfect.

            const response = await api.post('/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            dispatch(updateProfileSuccess(response.data.user));
            setStatus('success');
            setMessage('Cập nhật thông tin thành công!');
            setAvatarFile(null); // Reset file input state after success

        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus('loading');

        try {
            await api.post('/profile/change-password', passwords);
            setPasswordStatus('success');
            setPasswordMessage('Đổi mật khẩu thành công!');
            setPasswords({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error: any) {
            setPasswordStatus('error');
            // If validation errors exist, backend returns 422 with errors object
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0] as string[];
                setPasswordMessage(firstError[0]);
            } else {
                setPasswordMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors group text-sm"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header background */}
                <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="px-6 flex flex-col items-center -mt-12 sm:flex-row sm:items-end sm:space-x-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 flex-shrink-0 relative shadow-sm">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                                    <FiUser size={36} />
                                </div>
                            )}

                            {/* Overlay for hover */}
                            <div
                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                onClick={triggerFileInput}
                            >
                                <FiCamera className="text-white w-8 h-8" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif, image/jpg"
                        />
                    </div>

                    <div className="mt-4 sm:mt-0 pb-2 text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                            {user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                        </span>
                    </div>
                </div>

                <div className="p-6 mt-4 border-t border-gray-100">
                    <form onSubmit={handleSubmit} className="max-w-2xl">

                        {status === 'success' && (
                            <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-xl flex items-start gap-2 border border-green-100 text-sm">
                                <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                                <p>{message}</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                                <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                                <p>{message}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="py-2.5 px-3 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-xl text-sm"
                                        disabled={status === 'loading'}
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="py-2.5 px-3 block w-full bg-gray-50 border-gray-200 text-gray-500 rounded-xl cursor-not-allowed text-sm"
                                        disabled
                                    />
                                    <p className="mt-2 text-xs text-gray-500 text-left">Email không thể thay đổi sau khi đăng ký.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white ${status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <FiSave /> Lưu Thay Đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Đổi mật khẩu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Đổi mật khẩu</h3>
                    <form onSubmit={handlePasswordSubmit} className="max-w-2xl">
                        {passwordStatus === 'success' && (
                            <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-xl flex items-start gap-2 border border-green-100 text-sm">
                                <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                                <p>{passwordMessage}</p>
                            </div>
                        )}

                        {passwordStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                                <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                                <p>{passwordMessage}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        value={passwords.current_password}
                                        onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-xl"
                                        disabled={passwordStatus === 'loading'}
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwords.new_password}
                                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-xl"
                                        disabled={passwordStatus === 'loading'}
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwords.new_password_confirmation}
                                        onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })}
                                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-xl"
                                        disabled={passwordStatus === 'loading'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordStatus === 'loading'}
                                className={`inline-flex justify-center items-center gap-2 py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-xl text-white ${passwordStatus === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                            >
                                {passwordStatus === 'loading' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <FiSave /> Lưu Mật Khẩu
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
