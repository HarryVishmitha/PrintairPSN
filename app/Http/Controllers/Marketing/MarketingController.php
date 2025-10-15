<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'activeCampaigns' => 0,
            'totalReach' => '0',
            'engagementRate' => '0%',
            'contentPosts' => 0,
        ];

        return Inertia::render('Marketing/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
