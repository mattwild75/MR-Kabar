<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\DuaFaktorService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $duaFaktor = app(DuaFaktorService::class);
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            // Keadaan 2FA akun ini. Hanya angka dan boolean yang dikirim —
            // kuncinya sendiri tidak pernah meninggalkan server kecuali sekali
            // saat pemasangan, lewat flash 'duaFaktorSiap'.
            'duaFaktor' => [
                'aktif' => $duaFaktor->aktif($user),
                'wajib' => $duaFaktor->wajibBagi($user),
                'sisaKodePemulihan' => count($duaFaktor->kodePemulihanTersimpan($user)),
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }
}
