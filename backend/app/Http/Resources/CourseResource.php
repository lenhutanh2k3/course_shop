<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'title'               => $this->title,
            'slug'                => $this->slug,
            'description'         => $this->description,
            'instructor'          => $this->instructor,
            'original_price'      => $this->original_price,
            'discounted_price'    => $this->discounted_price,
            'discount_percentage' => $this->discount_percentage,
            'image_url'           => $this->image_url,
            'download_file_path'  => $this->download_file_path,
            'download_file_name'  => $this->download_file_name,
            'is_published'        => $this->is_published,
            'category'            => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ],
            'created_at'          => $this->created_at->format('Y-m-d'),
        ];
    }
}
