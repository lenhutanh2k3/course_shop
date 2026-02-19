<?php 
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseController;

//auth
Route::post('/register',[AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function(){
    Route::post('/logout',[AuthController::class, 'logout']);
    Route::get('/me',[AuthController::class, 'me']);
    
});

//categories
Route::get('/categories',[CategoryController::class, 'index']);
Route::get('/categories/{slug}',[CategoryController::class, 'show']);

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function(){
    Route::post('/categories',[CategoryController::class, 'store']);
    Route::put('/categories/{id}',[CategoryController::class, 'update']);
    Route::delete('/categories/{id}',[CategoryController::class, 'destroy']);
});

//course
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::post('/courses/{id}/restore', [CourseController::class, 'restore']);
    Route::delete('/courses/{id}/force', [CourseController::class, 'forceDelete']);
});
