<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;
use function PHPUnit\Framework\returnArgument;

class StoreRequest extends FormRequest
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
            "name" => ["required", "string", "max:255"],
            "academic_degree" => ["required", "string", "max:255"],
            "email" => ["required", "email", "unique:teachers,email"],
            "phone" => ["required", "string", "min:9", "max:12"],
            "teacher_type_id" => ["required", "exists:teacher_types,id"],
            "image" => ["nullable", "image", "mimes:jpeg,png,jpg,gif,webp", "max:2048"],
        ];
    }
      public function messages(): array
    {
        return [
            "name.required" => "El nombre es obligatorio.",
            "name.string" => "El nombre debe ser un texto válido.",
            "name.max" => "El nombre no puede exceder los 255 caracteres.",
            
            "academic_degree.required" => "El grado académico es obligatorio.",
            "academic_degree.string" => "El grado académico debe ser un texto válido.",
            "academic_degree.max" => "El grado académico no puede exceder los 255 caracteres.",
            
            "email.required" => "El correo electrónico es obligatorio.",
            "email.email" => "El correo electrónico debe tener un formato válido.",
            "email.unique" => "Este correo electrónico ya está registrado.",
            
            "phone.required" => "El teléfono es obligatorio.",
            "phone.string" => "El teléfono debe ser un texto válido.",
            "phone.min" => "El teléfono debe tener al menos 9 caracteres.",
            "phone.max" => "El teléfono no puede exceder los 12 caracteres.",
            
            "teacher_type_id.required" => "El tipo de docente es obligatorio.",
            "teacher_type_id.exists" => "El tipo de docente seleccionado no es válido.",
            
            "image.image" => "El archivo debe ser una imagen válida.",
            "image.mimes" => "La imagen debe ser de tipo: jpeg, png, jpg, gif.",
            "image.max" => "La imagen no puede exceder los 2MB.",
        ];
    }
}
