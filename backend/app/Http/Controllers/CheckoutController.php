<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Course;
use App\Traits\ApiResponse;
use App\Services\VNPayService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderCompletedMail;

class CheckoutController extends Controller
{
    use ApiResponse;
    
    protected $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    public function process(Request $request)
    {
        $request->validate([
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'exists:courses,id',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
        ]);

        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            $request->validate([
                'guest_name' => 'required|string|max:255',
                'guest_email' => 'required|email|max:255',
            ]);
        }

        $emailToCheck = $user ? $user->email : $request->guest_email;

        $existingPurchases = OrderItem::whereIn('course_id', $request->course_ids)
            ->whereHas('order', function($q) use ($user, $emailToCheck) {
                $q->where('status', 'completed')
                  ->where(function($subQ) use ($user, $emailToCheck) {
                      if ($user) {
                          $subQ->where('user_id', $user->id)->orWhere('guest_email', $emailToCheck);
                      } else {
                          $subQ->where('guest_email', $emailToCheck);
                      }
                  });
            })
            ->with('course')
            ->get();

        if ($existingPurchases->isNotEmpty()) {
            $duplicateCourseTitles = $existingPurchases->map(function($item) {
                return $item->course->title;
            })->unique()->implode(', ');

            return $this->errorResponse(
                'Bạn đã sở hữu (các) khóa học: ' . $duplicateCourseTitles . '. Vui lòng kiểm tra lại Lịch sử đơn hàng.',
                null,
                400
            );
        }

        try {
            DB::beginTransaction();
            
            $courses = Course::whereIn('id', $request->course_ids)->get();
            $totalAmount = 0;
            
            foreach ($courses as $course) {
                $totalAmount += $course->discounted_price;
            }

            if ($totalAmount == 0) {
                $order = Order::create([
                    'user_id' => $user ? $user->id : null,
                    'guest_name' => $user ? $user->name : $request->guest_name,
                    'guest_email' => $user ? $user->email : $request->guest_email,
                    'guest_phone' => $request->guest_phone,
                    'total_amount' => 0,
                    'status' => 'completed',
                    'payment_method' => 'free',
                ]);

                foreach ($courses as $course) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $course->id,
                        'price' => 0,
                    ]);
                }

                try {
                    Mail::to($order->guest_email)->send(new OrderCompletedMail($order));
                } catch (\Exception $e) {
                    Log::error('Mail Error (Free Course): ' . $e->getMessage());
                }

                DB::commit();

                return $this->successResponse([
                    'is_free' => true,
                    'order_id' => $order->id
                ], 'Order created and completed successfully (Free).');
            }

            if ($totalAmount < 0) {
                throw new \Exception("Invalid order amount");
            }

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'guest_name' => $user ? $user->name : $request->guest_name,
                'guest_email' => $user ? $user->email : $request->guest_email,
                'guest_phone' => $request->guest_phone,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => 'vnpay',
            ]);

            foreach ($courses as $course) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => $course->id,
                    'price' => $course->discounted_price,
                ]);
            }

            $vnp_TxnRef = $order->id . '_' . time();

            $returnUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/payment-result';
            $vnpUrl = $this->vnpayService->createPaymentUrl($order->id, $totalAmount, $returnUrl, $vnp_TxnRef);
            
            $order->update(['vnp_txn_ref' => $vnp_TxnRef]);

            DB::commit();

            return $this->successResponse([
                'payment_url' => $vnpUrl,
                'order_id' => $order->id
            ], 'Order created successfully. Redirecting to payment...');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout Error: ' . $e->getMessage());
            return $this->errorResponse('Checkout failed: ' . $e->getMessage(), null, 500);
        }
    }

    public function handleVNPayCallback(Request $request)
    {
        $isValid = $this->vnpayService->validateCallback($request->all());

        if (!$isValid) {
            return response()->json(['success' => false, 'message' => 'Invalid Callback Signature'], 400);
        }

        $vnp_ResponseCode = $request->vnp_ResponseCode;
        $orderIdAndTimestamp = explode('_', $request->vnp_TxnRef);
        $orderId = $orderIdAndTimestamp[0];

        $order = Order::find($orderId);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->status === 'completed') {
            return response()->json(['success' => true, 'message' => 'Order already completed']);
        }

        if ($vnp_ResponseCode == '00') {
            $order->update(['status' => 'completed']);
            
            try {
                Mail::to($order->guest_email)->send(new OrderCompletedMail($order));
            } catch (\Exception $e) {
                Log::error('Mail Error: ' . $e->getMessage());
            }

            return response()->json(['success' => true, 'message' => 'Payment successful', 'order_id' => $order->id]);
        } else {
            $order->update(['status' => 'failed']);
            return response()->json(['success' => false, 'message' => 'Payment failed']);
        }
    }
}
