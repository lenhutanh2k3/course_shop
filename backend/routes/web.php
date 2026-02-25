<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Fallback route to serve images if storage:link fails on Windows
Route::get('/storage/courses/{filename}', function ($filename) {
    $path = storage_path('app/public/courses/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
});
