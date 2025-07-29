<?php

namespace App\Http\Requests\Gallery;

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
            "type" => ['required', 'string', 'max:255'],
            "image" => ["nullable", "image", "mimes:jpeg,png,jpg,gif,webp", "max:2048"],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'El nombre es obligatorio.',
            'type.string' => 'El nombre debe ser un texto válido.',
            'type.max' => 'El nombre no puede exceder los 255 caracteres.',

            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp.',
            'image.max' => 'La imagen no puede superar los 2MB.',
        ];
    }
}
