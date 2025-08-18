<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'image'           => $this->image,
            'updated_at'      => $this->updated_at?->format('Y-m-d H:i'),
            'updated_by'      => $this->updater?->name ?? 'Desconocido',
        ];
    }
}
