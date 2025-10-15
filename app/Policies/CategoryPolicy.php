<?php

namespace App\Policies;

use App\Enums\CategoryStatus;
use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     * Member: view only
     * All other roles: can view
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager', 'designer', 'marketing', 'member']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Category $category): bool
    {
        // All authenticated users can view categories
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Super Admin: full
     * Admin: full within org
     * Manager: can create
     * Designer: can create
     * Marketing: no
     * Member: no
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager', 'designer']);
    }

    /**
     * Determine whether the user can update the model.
     * Super Admin: full
     * Admin: full within org
     * Manager: can update
     * Designer: edit media & descriptions only
     * Marketing: no direct edit (approve only)
     * Member: no
     */
    public function update(User $user, Category $category): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('admin')) {
            return true; // Can add working group scope check here
        }

        if ($user->hasRole('manager')) {
            return true;
        }

        if ($user->hasRole('designer')) {
            // Designers can only edit media and descriptions for draft categories
            return $category->status === CategoryStatus::DRAFT;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Super Admin: full
     * Admin: full within org
     * Manager: can delete if no children/products
     * Others: no
     */
    public function delete(User $user, Category $category): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('manager')) {
            return $category->canBeDeleted();
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Category $category): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can publish the category.
     * Super Admin: yes
     * Admin: yes
     * Manager: request publish (moderation queue)
     * Marketing (Approver): yes
     * Others: no
     */
    public function publish(User $user, Category $category): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin', 'marketing'])) {
            return true;
        }

        // Manager can request publish but needs approval
        if ($user->hasRole('manager')) {
            return true; // Will enter moderation queue
        }

        return false;
    }

    /**
     * Determine whether the user can unpublish the category.
     */
    public function unpublish(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'marketing']);
    }

    /**
     * Determine whether the user can archive the category.
     */
    public function archive(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager']);
    }

    /**
     * Determine whether the user can reorder categories.
     * Super Admin: yes
     * Admin: yes
     * Manager: yes
     * Others: no
     */
    public function reorder(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager']);
    }

    /**
     * Determine whether the user can move a category (change parent).
     * Super Admin: yes
     * Admin: yes
     * Manager: only draft categories
     * Others: no
     */
    public function move(User $user, Category $category): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        if ($user->hasRole('manager')) {
            return $category->status === CategoryStatus::DRAFT;
        }

        return false;
    }

    /**
     * Determine whether the user can attach/detach products.
     * Super Admin: yes
     * Admin: yes
     * Manager: yes
     * Designer: no
     * Others: no
     */
    public function manageProducts(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager']);
    }

    /**
     * Determine whether the user can manage working group visibility.
     * Super Admin: yes
     * Admin: yes
     * Others: no
     */
    public function manageWorkingGroups(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Determine whether the user can upload/manage media.
     * Super Admin: yes
     * Admin: yes
     * Manager: yes
     * Designer: yes
     * Others: no
     */
    public function manageMedia(User $user, Category $category): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'manager', 'designer']);
    }

    /**
     * Determine whether the user can approve moderation requests.
     * Marketing (Approver): yes
     * Super Admin: yes
     * Admin: yes
     * Others: no
     */
    public function approveModeration(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'marketing']);
    }
}
