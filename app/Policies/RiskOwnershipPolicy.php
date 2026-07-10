<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Basis otorisasi row-level untuk data risiko yang dimiliki per-PIC: IRS_Pemda
 * (I_b), KRS_PD/IRS_PD (II_a/II_b), KRO_PD/IRO_PD (III_a/III_b). Aturan sama
 * untuk kelimanya, jadi ditulis sekali di sini dan dipakai lewat 5 subclass
 * tipis (satu per model, mengikuti konvensi Gate::policy() per model) alih-alih
 * duplikasi logika 5 kali.
 *
 * KRS_Pemda (I_a) TIDAK memakai policy ini — levelnya lintas-OPD, dibatasi
 * berbeda (hanya admin/super-admin yang boleh input, bukan row-level).
 */
abstract class RiskOwnershipPolicy
{
    /**
     * admin & super-admin bebas mengelola semua baris (lintas-OPD), termasuk
     * baris lama yang belum punya user_id (NULL) — supaya tetap ada yang bisa
     * membereskan/assign data lama tanpa perlu login sebagai pemiliknya.
     */
    public function update(User $user, Model $model): bool
    {
        return $this->isAdmin($user) || $model->user_id === $user->id;
    }

    public function delete(User $user, Model $model): bool
    {
        return $this->isAdmin($user) || $model->user_id === $user->id;
    }

    private function isAdmin(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super-admin');
    }
}
