<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'myOrders' => 0,
            'myAssets' => 0,
            'activeRequests' => 0,
        ];

        return Inertia::render('Member/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
