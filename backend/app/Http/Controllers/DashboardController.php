<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Course;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics for the dashboard.
     */
    public function getStats()
    {
        // Total revenue from completed orders
        $totalRevenue = Order::where('status', 'completed')->sum('total_amount');

        // Total number of orders 
        $totalOrders = Order::count();

        // Total number of registered users (excluding admins if desired, but here we count all users with role 'user')
        $totalUsers = User::where('role', 'user')->count();

        // Total number of courses
        $totalCourses = Course::count();

        // Get 5 most recent orders with user and items
        $recentOrders = Order::with(['user', 'items.course'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_orders'  => $totalOrders,
            'total_users'   => $totalUsers,
            'total_courses' => $totalCourses,
            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * Get revenue chart data (e.g., daily revenue for the last 30 days).
     */
    public function getRevenueChart(Request $request)
    {
        $days = $request->query('days', 30); // Default to last 30 days
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        // Get daily revenue
        // Group by date, sum total_amount
        $revenueData = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // To ensure all days exist in the chart even if revenue is 0, we can fill the gaps
        $chartData = [];
        for ($i = 0; $i < $days; $i++) {
            $dateString = Carbon::now()->subDays($days - 1 - $i)->format('Y-m-d');
            
            // Find if we have revenue for this date
            $revenueRecord = $revenueData->firstWhere('date', $dateString);
            
            $chartData[] = [
                'date'    => Carbon::parse($dateString)->format('d/m'), // Display format d/m
                'revenue' => $revenueRecord ? (float) $revenueRecord->revenue : 0,
            ];
        }

        return response()->json($chartData);
    }
}
