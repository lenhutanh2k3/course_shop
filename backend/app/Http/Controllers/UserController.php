<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Traits\ApiResponse;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Update currently authenticated user profile (name, avatar).
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ]
        ], 200);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Mật khẩu hiện tại không chính xác.', null, 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->successResponse(null, 'Đổi mật khẩu thành công.');
    }

    /**
     * Get a paginated list of all users.
     */
    public function index(Request $request)
    {
        $query = User::query()->withTrashed();

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Filter by role
        if ($request->has('role') && !empty($request->role)) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter by deleted
        if ($request->has('is_deleted') && $request->is_deleted === 'true') {
            $query->whereNotNull('deleted_at');
        } elseif ($request->has('is_deleted') && $request->is_deleted === 'false') {
            $query->whereNull('deleted_at');
        }

        // Sorting
        $sortField = $request->has('sort_by') ? $request->sort_by : 'created_at';
        $sortOrder = $request->has('sort_order') && $request->sort_order === 'asc' ? 'asc' : 'desc';
        
        $allowedSorts = ['name', 'email', 'role', 'status', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->latest();
        }

        $users = $query->paginate($request->get('per_page', 10));
        
        // Transform the collection to include full avatar URL
        $users->getCollection()->transform(function ($user) {
            $user->avatar = $user->avatar ? asset('storage/' . $user->avatar) : null;
            return $user;
        });

        return response()->json($users);
    }

    /**
     * Update user role or information.
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Don't allow an admin to demote themselves to prevent getting locked out
        if ($user->id === auth()->id() && $request->role === 'user') {
            return response()->json(['message' => 'Bạn không thể thay đổi quyền của chính mình.'], 403);
        }

        $request->validate([
            'role' => 'sometimes|in:user,admin',
        ]);

        if ($request->has('role')) {
            $user->role = $request->role;
            $user->save();
        }

        return response()->json([
            'message' => 'Cập nhật quyền người dùng thành công',
            'user' => $user
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroy($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Bạn không thể tự xóa tài khoản của mình.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Đã đưa người dùng vào thùng rác']);
    }

    /**
     * Ban or unban a user.
     */
    public function ban(Request $request, $id)
    {
        $user = User::withTrashed()->findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Bạn không thể khóa tài khoản của chính mình.'], 403);
        }

        $user->status = $user->status === 'active' ? 'banned' : 'active';
        $user->save();

        $action = $user->status === 'banned' ? 'Khóa' : 'Mở khóa';
        return response()->json([
            'message' => "Đã {$action} tài khoản người dùng",
            'user' => $user
        ]);
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'Đã khôi phục người dùng',
            'user' => $user
        ]);
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Bạn không thể tự xóa vĩnh viễn tài khoản của mình.'], 403);
        }

        $user->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn người dùng']);
    }

    /**
     * Get user's wishlisted courses.
     */
    public function getWishlist()
    {
        $user = Auth::user();
        
        // Eager load category if needed
        $wishlist = $user->wishlist()->with('category')->latest()->get();

        return response()->json([
            'data' => $wishlist
        ]);
    }

    /**
     * Check if a course is in the user's wishlist
     */
    public function checkWishlist($course_id)
    {
        $user = Auth::user();
        $exists = $user->wishlist()->where('course_id', $course_id)->exists();

        return response()->json([
            'is_wishlisted' => $exists
        ]);
    }

    /**
     * Toggle a course in the wishlist (add if missing, remove if present).
     */
    public function toggleWishlist(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id'
        ]);

        $user = Auth::user();
        $courseId = $request->course_id;

        // toggle() will add if it doesn't exist, and remove if it does
        $result = $user->wishlist()->toggle($courseId);

        $isAttached = count($result['attached']) > 0;

        return response()->json([
            'message' => $isAttached ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
            'is_wishlisted' => $isAttached
        ]);
    }
}
