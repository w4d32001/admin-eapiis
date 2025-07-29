<?php

namespace App\Http\Requests\News;

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
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            "image" => ["nullable", "image", "mimes:jpeg,png,jpg,gif,webp", "max:2048"],
            'date' => ['required', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.string' => 'El título debe ser un texto válido.',
            'title.max' => 'El título no puede exceder los 255 caracteres.',

            'content.required' => 'El contenido es obligatorio.',
            'content.string' => 'El contenido debe ser un texto válido.',

            'location.required' => 'La ubicación es obligatoria.',
            'location.string' => 'La ubicación debe ser un texto válido.',
            'location.max' => 'La ubicación no puede exceder los 255 caracteres.',

            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp.',
            'image.max' => 'La imagen no puede superar los 2MB.',

            'date.required' => 'La fecha es obligatoria.',
            'date.date' => 'La fecha debe tener un formato válido.',
            'date.after_or_equal' => 'La fecha debe ser hoy o una fecha futura.',
        ];
    }

}
