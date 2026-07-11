<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->load('roles:id,name'),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'justLoggedIn' => session('just_logged_in'),
                'importResult' => session('importResult'),
            ],
            'setting' => fn() => SettingApp::cached(),
            'unreadNotificationsCount' => fn() => $request->user()?->unreadNotifications()->count() ?? 0,
        ]);
    }
}
