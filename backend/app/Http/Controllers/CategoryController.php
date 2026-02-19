<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Traits\ApiResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        // Lấy danh mục kèm số lượng khóa học
        $categories = Category::withCount('courses')->get();
        
        // Format dữ liệu thủ công bằng map()
        $data = $categories->map(function ($category) {
            return [
                'id'           => $category->id,
                'name'         => $category->name,
                'slug'         => $category->slug,
                'description'  => $category->description,
                'course_count' => $category->courses_count,
            ];
        });

        return $this->successResponse($data, 'Lấy danh sách danh mục thành công');
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)->withCount('courses')->first();

        if (!$category) {
            return $this->errorResponse('Không tìm thấy danh mục', null, 404);
        }

        // Trả về dữ liệu dưới dạng mảng thủ công
        $data = [
            'id'           => $category->id,
            'name'         => $category->name,
            'slug'         => $category->slug,
            'description'  => $category->description,
            'course_count' => $category->courses_count,
        ];

        return $this->successResponse($data, 'Lấy chi tiết danh mục thành công');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|unique:categories,name|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $category = Category::create([
            'name'        => $validated['name'],
            'slug'        => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return $this->successResponse($category, 'Thêm danh mục thành công', 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            // Phải ignore ID này để tránh lỗi trùng tên với chính nó
            'name'        => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:500',
        ]);

        $category->update([
            'name'        => $validated['name'],
            'slug'        => Str::slug($validated['name']),
            'description' => $validated['description'] ?? $category->description,
        ]);

        return $this->successResponse($category->fresh(), 'Cập nhật danh mục thành công');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Chặn xóa nếu có khóa học liên kết
        if ($category->courses()->exists()) {
            return $this->errorResponse('Không thể xóa danh mục đang có khóa học', null, 400);
        }

        $category->delete();

        return $this->successResponse(null, 'Xóa danh mục thành công');
    }
}