<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class OrderController extends Controller
{
    use ApiResponse;

    public function myOrders()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['items.course' => function($query) {
                $query->select('id', 'title', 'slug', 'image_url', 'download_file_path', 'download_file_name');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($orders, 'Lấy lịch sử đơn hàng thành công');
    }

    public function index(Request $request)
    {
        $query = Order::query()->with('user');

        // Search by guest name, guest email, user name, user email
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('guest_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('guest_email', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('guest_phone', 'LIKE', "%{$searchTerm}%");
                
                $q->orWhereHas('user', function($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                              ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });
            });
        }

        // Filter by Status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && !empty($request->payment_method)) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->date_from));
        }
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->date_to));
        }

        $sortField = $request->has('sort_by') ? $request->sort_by : 'created_at';
        $sortOrder = $request->has('sort_order') && in_array(strtolower($request->sort_order), ['asc', 'desc']) 
                     ? strtolower($request->sort_order) 
                     : 'desc';
        
        $allowedSorts = ['id', 'guest_name', 'total_amount', 'status', 'payment_method', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->latest();
        }

        $orders = $query->paginate($request->get('per_page', 10));
        return $this->successResponse($orders, 'Lấy danh sách đơn hàng thành công');
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.course'])->findOrFail($id);
        return $this->successResponse($order, 'Lấy chi tiết đơn hàng thành công');
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:pending,completed,failed,cancelled'
        ]);

        $order->status = $request->status;
        $order->save();

        return $this->successResponse($order, 'Cập nhật trạng thái đơn hàng thành công');
    }
}
