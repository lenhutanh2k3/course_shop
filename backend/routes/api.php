<?php 
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
//auth
Route::post('/register',[AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function(){
    Route::post('/logout',[AuthController::class, 'logout']);
    Route::get('/me',[AuthController::class, 'me']);
    
    // Profile
    Route::post('/profile', [UserController::class, 'updateProfile']);
    Route::post('/profile/change-password', [UserController::class, 'changePassword']);
});

//categories
Route::get('/categories',[CategoryController::class, 'index']);
Route::get('/categories/{slug}',[CategoryController::class, 'show']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function(){
    Route::post('/categories',[CategoryController::class, 'store']);
    Route::put('/categories/{id}',[CategoryController::class, 'update']);
    Route::delete('/categories/{id}',[CategoryController::class, 'destroy']);
});

//course
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/courses', [CourseController::class, 'adminIndex']);
    Route::get('/courses/trashed', [CourseController::class, 'trashed']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::post('/courses/{id}/restore', [CourseController::class, 'restore']);
    Route::delete('/courses/{id}/force', [CourseController::class, 'forceDelete']);

    // Dashboard Analytics
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/chart', [DashboardController::class, 'getRevenueChart']);

    // Users Management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::put('/users/{id}/ban', [UserController::class, 'ban']);
    Route::put('/users/{id}/restore', [UserController::class, 'restore']);
    Route::delete('/users/{id}/force', [UserController::class, 'forceDelete']);

    // Orders Management
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});

//cart
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/sync', [CartController::class, 'sync']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::delete('/cart/{courseId}', [CartController::class, 'remove']);
    Route::delete('/cart/clear/all', [CartController::class, 'clear']);

    // Order History
    Route::get('/orders', [OrderController::class, 'myOrders']);

    // Wishlist
    Route::get('/wishlist', [UserController::class, 'getWishlist']);
 Route::post('/wishlist/toggle', [UserController::class, 'toggleWishlist']);
    Route::get('/wishlist/check/{course_id}', [UserController::class, 'checkWishlist']);
});

// Checkout
Route::post('/checkout', [CheckoutController::class, 'process']);
Route::get('/vnpay/callback', [CheckoutController::class, 'handleVNPayCallback']);