<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
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
            'teacher_type'    => $this->teacherType 
                                ? new TeacherTypeResource($this->teacherType) 
                                : null,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'academic_degree' => $this->academic_degree,
            'image'           => $this->image,
            'updated_at'      => $this->updated_at?->format('Y-m-d H:i'),
            'updated_by'      => $this->updater?->name ?? 'Desconocido',
        ];
    }
}
