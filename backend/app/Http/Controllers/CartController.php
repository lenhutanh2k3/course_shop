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

    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
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

        $cart->items()->create([
            'course_id'     => $course->id,
            'quantity'      => 1,
            'price_at_add'  => $course->discounted_price,
        ]);

        return $this->successResponse(null, 'Đã thêm khóa học vào giỏ hàng');
    }

    public function sync(Request $request)
    {
        $request->validate([
            'course_ids' => 'array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $cart = $this->getOrCreateCart($request);
        $localCourseIds = $request->input('course_ids', []);

        foreach ($localCourseIds as $courseId) {
            $existingItem = $cart->items()->where('course_id', $courseId)->first();
            if (!$existingItem) {
                $course = Course::find($courseId);
                if ($course) {
                    $cart->items()->create([
                        'course_id' => $course->id,
                        'quantity' => 1,
                        'price_at_add' => $course->discounted_price,
                    ]);
                }
            }
        }

        // Return updated cart
        $cart->load('items.course');
        $items = $cart->items->map(function ($item) {
            return [
                'id' => $item->id,
                'course' => new CourseResource($item->course),
                'quantity' => $item->quantity,
            ];
        });

        return $this->successResponse([
            'cart_id' => $cart->id,
            'items' => $items,
        ], 'Đồng bộ giỏ hàng thành công');
    }

    public function remove(Request $request, $courseId)
    {
        $cart = $this->getOrCreateCart($request);

        $item = $cart->items()->where('course_id', $courseId)->first();

        if (!$item) {
            return $this->errorResponse('Không tìm thấy khóa học trong giỏ hàng', null, 404);
        }

        $item->delete();

        return $this->successResponse(null, 'Đã xóa khóa học khỏi giỏ hàng');
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return $this->successResponse(null, 'Đã xóa toàn bộ giỏ hàng');
    }

    private function getOrCreateCart(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            return Cart::firstOrCreate(
                ['user_id' => $user->id],
                ['session_id' => session()->getId()]
            );
        }

        return Cart::firstOrCreate(
            ['session_id' => session()->getId()],
            ['user_id' => null]
        );
    }
}
