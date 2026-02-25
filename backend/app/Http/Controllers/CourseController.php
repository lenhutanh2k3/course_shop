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
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Course::where('is_published', true)->with('category');

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

        if ($request->filled('price_range')) {
            $priceRange = $request->input('price_range');
            switch ($priceRange) {
                case 'free':
                    $query->where('discounted_price', 0);
                    break;
                case 'under_100k':
                    $query->where('discounted_price', '>', 0)->where('discounted_price', '<', 100000);
                    break;
                case '100k_500k':
                    $query->whereBetween('discounted_price', [100000, 500000]);
                    break;
                case '500k_1m':
                    $query->whereBetween('discounted_price', [500000, 1000000]);
                    break;
                case 'over_1m':
                    $query->where('discounted_price', '>', 1000000);
                    break;
            }
        }

        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('discounted_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('discounted_price', 'desc');
                break;
            case 'discount_desc':
                $query->orderByRaw('(original_price - discounted_price) / original_price DESC');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'latest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $courses = $query->paginate(9);

        return $this->successResponse(
            new CourseCollection($courses),
            'Lấy danh sách khóa học thành công'
        );
    }

    public function adminIndex()
    {
        $courses = Course::with('category')->latest()->get();
        return $this->successResponse(
            $courses,
            'Lấy danh sách khóa học thành công'
        );
    }

    public function trashed()
    {
        $courses = Course::onlyTrashed()->with('category')->latest()->get();
        return $this->successResponse(
            $courses,
            'Lấy danh sách khóa học đã xóa thành công'
        );
    }

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

    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('courses', $filename, 'public');
            $validated['image_url'] = url('/storage/' . $path);
        }
        
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);

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

    public function update(UpdateCourseRequest $request, Course $course)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('courses', $filename, 'public');
            $validated['image_url'] = url('/storage/' . $path);
        }

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);

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

    public function destroy(Course $course)
    {
        $course->delete();

        return $this->successResponse(
            null,
            'Khóa học đã được xóa (soft delete)'
        );
    }

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