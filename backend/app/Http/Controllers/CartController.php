<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Course;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CartResource;
use App\Http\Resources\CourseResource;
class CartController extends Controller
{
   use ApiResponse;

    /**
     * Lấy giỏ hàng hiện tại (public cho guest, protected cho user)
     */
    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);

        // Load items + course relation
        $cart->load('items.course');

        $items = $cart->items->map(function ($item) {
            return [
                'id'               => $item->id,
                'course'           => new CourseResource($item->course),
                'quantity'         => $item->quantity,
                'price_at_add'     => $item->price_at_add,
                'subtotal'         => $item->quantity * $item->price_at_add,
            ];
        });

        $total = $items->sum('subtotal');

        return $this->successResponse([
            'cart_id'     => $cart->id,
            'items'       => $items,
            'total'       => $total,
            'item_count'  => $items->count(),
        ], 'Lấy giỏ hàng thành công');
    }

    /**
     * Thêm khóa học vào giỏ
     */
    public function add(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($request->course_id);

        $cart = $this->getOrCreateCart($request);

        // Kiểm tra khóa học đã có trong giỏ chưa
        $existingItem = $cart->items()->where('course_id', $course->id)->first();

        if ($existingItem) {
            return $this->errorResponse('Khóa học này đã có trong giỏ hàng', null, 400);
        }

        // Thêm item mới
        $cart->items()->create([
            'course_id'     => $course->id,
            'quantity'      => 1,
            'price_at_add'  => $course->discounted_price,  // Lưu giá giảm tại thời điểm thêm
        ]);

        return $this->successResponse(null, 'Đã thêm khóa học vào giỏ hàng');
    }

    /**
     * Xóa một item khỏi giỏ
     */
    public function remove(Request $request, $itemId)
    {
        $item = CartItem::findOrFail($itemId);

        $cart = $item->cart;

        // Kiểm tra quyền sở hữu giỏ
        if ($cart->user_id && $cart->user_id !== Auth::id()) {
            return $this->errorResponse('Không có quyền xóa item này', null, 403);
        }

        if (!$cart->user_id && $cart->session_id !== session()->getId()) {
            return $this->errorResponse('Không có quyền xóa item này', null, 403);
        }

        $item->delete();

        return $this->successResponse(null, 'Đã xóa khóa học khỏi giỏ hàng');
    }

    /**
     * Xóa toàn bộ giỏ hàng (clear cart)
     */
    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return $this->successResponse(null, 'Đã xóa toàn bộ giỏ hàng');
    }

    /**
     * Helper: Lấy hoặc tạo giỏ hàng mới
     */
    private function getOrCreateCart(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            // User login: tìm hoặc tạo giỏ theo user_id
            return Cart::firstOrCreate(
                ['user_id' => $user->id],
                ['session_id' => session()->getId()]
            );
        }

        // Guest: dùng session_id
        return Cart::firstOrCreate(
            ['session_id' => session()->getId()],
            ['user_id' => null]
        );
    }
}
