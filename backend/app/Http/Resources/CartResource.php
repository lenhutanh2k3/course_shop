<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CartItemResource;
class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         $items = CartItemResource::collection($this->items);

        $total = $items->sum('subtotal');

        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'session_id'  => $this->session_id,
            'items'       => $items,
            'total'       => $total,
            'item_count'  => $items->count(),
            'created_at'  => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
