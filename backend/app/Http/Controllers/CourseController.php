<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseCollection;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    use ApiResponse;

    // Public: Danh sách khóa học
    public function index(Request $request)
    {
        $query = Course::where('is_published', true)->with('category');

        // Search theo title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        // Filter theo category slug
        if ($request->filled('category_slug')) {
            $category = Category::where('slug', $request->input('category_slug'))->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Sort theo discount cao nhất
        if ($request->input('sort') === 'discount_desc') {
            $query->orderByRaw('(original_price - discounted_price) / original_price DESC');
        }

        $courses = $query->paginate(12);

        return $this->successResponse(
            new CourseCollection($courses),
            'Lấy danh sách khóa học thành công'
        );
    }

    // Public: Chi tiết khóa học
    public function show($slug)
    {
        $course = Course::where('slug', $slug)
            ->where('is_published', true)
            ->with('category')
            ->firstOrFail();

        return $this->successResponse(
            new CourseResource($course),
            'Lấy chi tiết khóa học thành công'
        );
    }

    // Admin: Tạo mới
    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();

        // Tạo slug nếu chưa có
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);

        // Đảm bảo slug unique (thêm số nếu trùng)
        $originalSlug = $validated['slug'];
        $count = 1;
        while (Course::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        $course = Course::create($validated);

        return $this->successResponse(
            new CourseResource($course),
            'Tạo khóa học thành công',
            201
        );
    }

    // Admin: Cập nhật
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $validated = $request->validated();

        // Tạo slug mới nếu title thay đổi
        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);

            // Kiểm tra unique slug (loại trừ bản thân)
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Course::where('slug', $validated['slug'])->where('id', '!=', $course->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $course->update($validated);

        return $this->successResponse(
            new CourseResource($course->fresh()),
            'Cập nhật khóa học thành công'
        );
    }

    // Admin: Soft delete
    public function destroy(Course $course)
    {
        $course->delete();

        return $this->successResponse(
            null,
            'Khóa học đã được xóa (soft delete)'
        );
    }

    // Admin: Khôi phục
    public function restore($id)
    {
        $course = Course::withTrashed()->findOrFail($id);

        if (!$course->trashed()) {
            return $this->errorResponse('Khóa học chưa bị xóa', null, 400);
        }

        $course->restore();

        return $this->successResponse(
            new CourseResource($course),
            'Khóa học đã được khôi phục'
        );
    }

    // Admin: Force delete
    public function forceDelete($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        $course->forceDelete();

        return $this->successResponse(
            null,
            'Khóa học đã được xóa vĩnh viễn'
        );
    }
}