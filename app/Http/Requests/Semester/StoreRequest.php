<?php

namespace App\Http\Requests\Semester;

use Illuminate\Foundation\Http\FormRequest;

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
            'number' => [
                'required',
                'integer',
                'between:1,10',
                'unique:semesters,number'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:5120'
            ],
            'is_active' => [
                'boolean'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'number.required' => 'El número de semestre es obligatorio.',
            'number.integer' => 'El número de semestre debe ser un número entero.',
            'number.between' => 'El número de semestre debe estar entre 1 y 10.',
            'number.unique' => 'Ya existe un semestre con este número.',
            'description.max' => 'La descripción no puede exceder los 1000 caracteres.',
            'image.required' => 'La imagen es obligatoria.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser de tipo: JPEG, JPG, PNG, GIF o WebP.',
            'image.max' => 'La imagen no debe ser mayor a 5MB.'
        ];
    }
}
