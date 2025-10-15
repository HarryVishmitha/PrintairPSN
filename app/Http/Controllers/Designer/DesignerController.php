<?php

namespace App\Http\Controllers\Designer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DesignerController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'totalAssets' => 0,
            'activeProjects' => 0,
            'recentUploads' => 0,
            'libraryItems' => 0,
        ];

        return Inertia::render('Designer/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
