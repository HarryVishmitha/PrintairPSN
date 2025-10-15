<?php

namespace Database\Factories;

use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Models\WorkingGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\WorkingGroup>
 */
class WorkingGroupFactory extends Factory
{
    protected $model = WorkingGroup::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name.'-'.$this->faker->unique()->numberBetween(100, 999)),
            'type' => $this->faker->randomElement([WorkingGroupType::PUBLIC, WorkingGroupType::COMPANY]),
            'status' => WorkingGroupStatus::ACTIVE,
            'settings' => [],
            'is_public_default' => false,
        ];
    }

    public function public(): self
    {
        return $this->state(fn () => [
            'type' => WorkingGroupType::PUBLIC,
            'is_public_default' => true,
        ]);
    }
}
