<?php

namespace App\Http\Requests;

use App\Enums\CategoryStatus;
use App\Enums\CategoryVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Category::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'slug' => [
                'nullable',
                'string',
                'min:3',
                'max:140',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories')->where(function ($query) {
                    return $query->where('locale', $this->input('locale'));
                }),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'status' => ['nullable', Rule::enum(CategoryStatus::class)],
            'visibility' => ['nullable', Rule::enum(CategoryVisibility::class)],
            'is_featured' => ['nullable', 'boolean'],
            'show_on_home' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:60'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'locale' => ['nullable', 'string', 'max:10'],
            'published_at' => ['nullable', 'date', 'after_or_equal:now'],
            'unpublished_at' => ['nullable', 'date', 'after:published_at'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required',
            'name.min' => 'Category name must be at least 3 characters',
            'name.max' => 'Category name must not exceed 120 characters',
            'slug.regex' => 'Slug must be in kebab-case (lowercase letters, numbers, and hyphens only)',
            'slug.unique' => 'This slug is already in use',
            'parent_id.exists' => 'The selected parent category does not exist',
            'meta_title.max' => 'Meta title should not exceed 60 characters for optimal SEO',
            'meta_description.max' => 'Meta description should not exceed 160 characters for optimal SEO',
            'published_at.after_or_equal' => 'Publication date must be in the future',
            'unpublished_at.after' => 'Unpublish date must be after publication date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('status')) {
            $this->merge(['status' => CategoryStatus::DRAFT->value]);
        }

        if (!$this->has('visibility')) {
            $this->merge(['visibility' => CategoryVisibility::GLOBAL->value]);
        }

        if (!$this->has('sort_order')) {
            $this->merge(['sort_order' => 0]);
        }
    }
}
