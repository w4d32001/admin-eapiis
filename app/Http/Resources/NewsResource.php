<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'date' => $this->date,
            'location' => $this->location,
            'content' => $this->content,
            'image' => $this->image,
            'public_id' => $this->public_id,
            'status' => $this->status,
            'created_by' => $this->created_by,
            'updated_by' => $this->updater?->name ?? 'Desconocido',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
