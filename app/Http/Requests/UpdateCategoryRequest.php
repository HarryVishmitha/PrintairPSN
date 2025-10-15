<?php

namespace App\Http\Requests;

use App\Enums\CategoryStatus;
use App\Enums\CategoryVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $category = $this->route('category');
        return $this->user()->can('update', $category);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoryId = $this->route('category')->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:3', 'max:120'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:140',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories')->where(function ($query) {
                    return $query->where('locale', $this->input('locale'));
                })->ignore($categoryId),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id', function ($attribute, $value, $fail) use ($categoryId) {
                // Prevent setting itself as parent
                if ($value === $categoryId) {
                    $fail('A category cannot be its own parent');
                }
                // Prevent cyclic relationships (checked in observer as well)
                $category = \App\Models\Category::find($value);
                $current = $this->route('category');
                if ($category && $current && $category->isDescendantOf($current)) {
                    $fail('Cannot set a descendant as parent');
                }
            }],
            'status' => ['sometimes', Rule::enum(CategoryStatus::class)],
            'visibility' => ['sometimes', Rule::enum(CategoryVisibility::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'show_on_home' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:60'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'published_at' => ['nullable', 'date'],
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
            'unpublished_at.after' => 'Unpublish date must be after publication date',
        ];
    }
}
