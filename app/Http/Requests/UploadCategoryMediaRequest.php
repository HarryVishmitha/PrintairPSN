<?php

namespace App\Http\Requests;

use App\Enums\MediaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadCategoryMediaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $category = $this->route('category');
        return $this->user()->can('manageMedia', $category);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,webp',
                'max:10240', // 10MB
                'dimensions:min_width=1200,min_height=600'
            ],
            'alt_text' => ['required', 'string', 'max:255'],
            'type' => ['nullable', Rule::enum(MediaType::class)],
            'focal_point' => ['nullable', 'array'],
            'focal_point.x' => ['required_with:focal_point', 'numeric', 'between:0,1'],
            'focal_point.y' => ['required_with:focal_point', 'numeric', 'between:0,1'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please select an image to upload',
            'file.image' => 'File must be an image',
            'file.mimes' => 'Image must be JPEG, PNG, or WebP format',
            'file.max' => 'Image size must not exceed 10MB',
            'file.dimensions' => 'Image must be at least 1200x600 pixels',
            'alt_text.required' => 'Alt text is required for accessibility',
            'focal_point.x.between' => 'Focal point X must be between 0 and 1',
            'focal_point.y.between' => 'Focal point Y must be between 0 and 1',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default type if not provided
        if (!$this->has('type')) {
            $this->merge(['type' => MediaType::PRIMARY->value]);
        }

        // Set default focal point if not provided
        if (!$this->has('focal_point')) {
            $this->merge(['focal_point' => ['x' => 0.5, 'y' => 0.5]]);
        }
    }
}
