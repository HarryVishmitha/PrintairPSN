<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'activeOrders' => 0,
            'pendingQuotes' => 0,
            'unpaidInvoices' => 0,
            'teamMembers' => 0,
        ];

        return Inertia::render('Manager/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
