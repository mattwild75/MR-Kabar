<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Auto-login sekali klik ke akun bersama CEE_Survey (role 'cee-survey'),
 * dipakai QR code di /panduan supaya responden CEE lintas-OPD tidak perlu
 * mengetik kredensial manual — langsung diarahkan ke 1a_Kuesioner CEE. Sama
 * pola dengan LaporQrLoginController (akun bersama LAPOR): kredensial akun
 * ini SENGAJA dipakai bersama (disebar lewat QR), scope aksesnya dikunci
 * ketat oleh RestrictCeeSurveyRole + ShareMenus (whitelist menu CEE saja).
 * Password dari env CEE_SURVEY_ACCOUNT_PASSWORD (sama pola dgn
 * LaporQrLoginController/LAPOR_ACCOUNT_PASSWORD) — TIDAK hardcode di kode.
 */
class CeeSurveyQrLoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        if (!Auth::check()) {
            Auth::attempt(['username' => 'CEE_Survey', 'password' => env('CEE_SURVEY_ACCOUNT_PASSWORD', '')]);

            $request->session()->regenerate();
            $request->session()->put('login_at', now()->timestamp);
        }

        return redirect('/cee/1a');
    }
}
