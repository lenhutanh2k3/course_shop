<?php 
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;

//auth
Route::post('/register',[AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function(){
    Route::post('/logout',[AuthController::class, 'logout']);
    Route::get('/me',[AuthController::class, 'me']);
    
});

//categories
Route::get('/categories',[CategoryController::class, 'index']);
Route::get('/categories/:slug',[CategoryController::class, 'show']);

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function(){
    Route::post('/categories',[CategoryController::class, 'store']);
    Route::put('/categories/:id',[CategoryController::class, 'update']);
    Route::delete('/categories/:id',[CategoryController::class, 'destroy']);
});
