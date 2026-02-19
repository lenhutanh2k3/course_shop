<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'              => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'unique:courses,title,' . $this->id
            ],
            'description'        => 'nullable|string',
            'instructor'         => 'nullable|string|max:255',
            'original_price'     => 'sometimes|required|numeric|min:0',
            'discounted_price'   => 'sometimes|required|numeric|min:0|lte:original_price',
            'category_id'        => 'sometimes|required|exists:categories,id',
            'image_url'          => 'nullable|url',
            'download_file_path' => 'nullable|string',
            'download_file_name' => 'nullable|string',
            'is_published'       => 'boolean',
        ];
    }
}
