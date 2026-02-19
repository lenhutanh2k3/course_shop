<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'course'           => [
                'id'               => $this->course->id,
                'title'            => $this->course->title,
                'slug'             => $this->course->slug,
                'image_url'        => $this->course->image_url,
                'discounted_price' => $this->course->discounted_price,
                'original_price'   => $this->course->original_price,
            ],
            'quantity'         => $this->quantity,
            'price_at_add'     => $this->price_at_add,
            'subtotal'         => $this->quantity * $this->price_at_add,
            'created_at'       => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
