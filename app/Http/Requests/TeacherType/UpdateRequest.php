<?php

namespace App\Http\Requests\TeacherType;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
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
            "name" => [
                "required",
                "string",
                "unique:teacher_types,name," . $this->route('teacher_type'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            "name.required" => "El campo nombre es obligatorio",
            "name.string" => "El campo nombre debe ser una cadena de caracteres",
            "name.unique" => "Ya existe un tipo de docente con ese nombre",
        ];
    }
}
