<?php

namespace Database\Seeders;

use App\Models\CeePertanyaan;
use App\Models\CeeUnsur;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seed 8 unsur Lingkungan Pengendalian (A-H) & pertanyaan kuesioner Form 1a,
 * ditranskripsi dari Lampiran 5 Perdep PPKD No.4/2019 ttg Pedoman Pengelolaan
 * Risiko Pada Pemerintah Daerah. Idempotent (updateOrCreate).
 *
 * Juga menyiapkan role 'cee-survey' + akun bersama CEE_Survey (password 1234)
 * yang dipakai bergantian oleh siapa saja minimal eselon IV lintas OPD untuk
 * mengisi Form Input CEE 1a/1b/1c — dibatasi HANYA ke menu CEE oleh middleware
 * RestrictCeeSurveyRole (bukan lewat permission_name menu, krn banyak menu
 * lain fail-open utk semua user login).
 */
class CeeSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'A' => [
                'nama' => 'Penegakan Integritas dan Nilai Etika',
                'pertanyaan' => [
                    'Pegawai mendapatkan pesan integritas & nilai etika secara rutin dari pimpinan instansi (Misalnya keteladanan, pesan moral dll)',
                    'Pemda telah memiliki aturan perilaku (misalnya kode etik, pakta integritas, dan aturan perilaku pegawai) yang telah dikomunikasikan kepada seluruh pegawai',
                    'Telah terdapat fungsi khusus di dalam instansi yang melayani pengaduan masyarakat atas pelanggaran aturan perilaku/kode etik',
                    'Pelanggaran aturan perilaku/kode etik telah ditindaklanjuti',
                ],
            ],
            'B' => [
                'nama' => 'Komitmen terhadap Kompetensi',
                'pertanyaan' => [
                    'Standar kompetensi setiap pegawai/posisi jabatan telah ditentukan',
                    'Pegawai yang kompeten telah secara tepat mengisi posisi/jabatan',
                    'Pemda telah memiliki dan menerapkan strategi peningkatan kompetensi pegawai',
                    'Terdapat pelatihan terkait pengelolaan risiko, baik pelatihan khusus maupun pelatihan terintegrasi secara berkala.',
                ],
            ],
            'C' => [
                'nama' => 'Kepemimpinan yang Kondusif',
                'pertanyaan' => [
                    'Pimpinan telah menetapkan kebijakan pengelolaan risiko yang memberikan kejelasan arah pengelolaan risiko',
                    'Pimpinan menerapkan pengelolaan risiko dan pengendalian dalam pelaksanaan tugas dan pengambilan keputusan',
                    'Pimpinan membangun komunikasi yang baik dengan anggota organisasi untuk berani mengungkapkan risiko dan secara terbuka menerima/menggali pelaporan risiko/masalah',
                    'Gaya pimpinan dapat mendorong pegawai untuk meningkatkan kinerja',
                    'Pimpinan menetapkan Sasaran strategis yang selaras dengan visi dan misi Pemda',
                    'Rencana/sasaran strategis pemda telah dijabarkan ke dalam sasaran OPD dan tingkat operasional OPD',
                    'Rencana strategis dan rencana kerja pemda telah menyajikan informasi mengenai risiko',
                    'Pimpinan berperan serta dan mengikutsertakan pejabat dan pegawai terkait dalam penetapan waktu pelaporan pelaksanaan peran dan tanggung jawab masing-masing dalam pengelolaan risiko',
                ],
            ],
            'D' => [
                'nama' => 'Pembentukan Struktur Organisasi yang Sesuai dengan Kebutuhan',
                'pertanyaan' => [
                    'Setiap Urusan telah dilaksanakan oleh OPD dan unit kerja yang tepat',
                    'Masing-masing pihak dalam organisasi telah memperoleh kejelasan dan memahami peran dan tanggung jawab masing-masing dalam pengelolaan risiko',
                    'Pegawai yang bertugas di OPD merupakan pegawai tetap dan bukan pegawai yang bersifat adhoc (sementara)',
                    'Penetapan sasaran dan penetapan waktu pelaporan pelaksanaan peran dan tanggung jawab masing-masing dalam pengelolaan risiko',
                ],
            ],
            'E' => [
                'nama' => 'Pendelegasian Wewenang dan Tanggung Jawab yang Tepat',
                'pertanyaan' => [
                    'Kriteria pendelegasian wewenang telah ditentukan dengan tepat',
                    'Pendelegasian wewenang dan tanggung jawab dilaksanakan secara tepat',
                    'Kewenangan direviu secara periodik',
                ],
            ],
            'F' => [
                'nama' => 'Penyusunan dan Penerapan Kebijakan yang Sehat tentang Pembinaan Sumber Daya Manusia',
                'pertanyaan' => [
                    'Pemda telah memiliki Kebijakan dan prosedur pengelolaan SDM yang lengkap (sejak rekrutmen sampai dengan pemberhentian pegawai)',
                    'Rekruitmen, retensi, mutasi, maupun promosi pemilihan SDM telah dilakukan dengan baik',
                    'Insentif pegawai telah sesuai dengan tanggung jawab dan kinerja',
                    'Pemda telah menginternalisasi budaya sadar risiko',
                    'Adanya pemberian reward dan/atau punishment atas pengelolaan risiko (Misalnya mempertimbangkan pertanggungjawaban pengelolaan risiko dalam penilaian kinerja)',
                    'Terdapat evaluasi kinerja pegawai, dan telah dipertimbangkan dalam perhitungan penghasilan',
                    'Instansi telah mengalokasikan anggaran yang memadai untuk pengembangan SDM',
                ],
            ],
            'G' => [
                'nama' => 'Perwujudan Peran Aparat Pengawasan Intern Pemerintah yang Efektif',
                'pertanyaan' => [
                    'Inspektorat Daerah melakukan reviu atas efisiensi/efektivitas pelaksanaan setiap urusan/program secara periodik',
                    'Inspektorat Daerah melakukan reviu atas kepatuhan hukum dan aturan lainnya',
                    'Inspektorat Daerah memberikan layanan fasilitasi penerapan pengelolaan risiko dan penyelenggaraan SPIP',
                    'APIP telah melaksanakan pengawasan berbasis risiko.',
                    'Temuan dan saran/rekomendasi pengawasan APIP telah ditindaklanjuti',
                ],
            ],
            'H' => [
                'nama' => 'Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait',
                'pertanyaan' => [
                    'Hubungan kerja yang baik dengan instansi/organisasi lain yang memiliki keterkaitan operasional telah terbangun',
                    'Hubungan kerja yang baik dengan instansi yang terkait atas fungsi pengawasan/pemeriksaan (inspektorat, BPKP, dan BPK) telah terbangun',
                ],
            ],
        ];

        $urutanUnsur = 1;
        foreach ($data as $kode => $unsurData) {
            $unsur = CeeUnsur::updateOrCreate(
                ['kode' => $kode],
                ['nama' => $unsurData['nama'], 'urutan' => $urutanUnsur++]
            );

            $urutanPertanyaan = 1;
            foreach ($unsurData['pertanyaan'] as $teks) {
                CeePertanyaan::updateOrCreate(
                    ['cee_unsur_id' => $unsur->id, 'urutan' => $urutanPertanyaan],
                    ['pertanyaan' => $teks, 'aktif' => true]
                );
                $urutanPertanyaan++;
            }
        }

        $role = Role::firstOrCreate(['name' => 'cee-survey']);

        // Role ini dibatasi ke prefix /cee, /cetak/cee, /data-umum, /dashboard
        // oleh RestrictCeeSurveyRole — tapi CheckMenuPermission tetap butuh
        // permission_name yg cocok utk menu /dashboard (dashboard-view),
        // jika tidak, akun ini 403 walau sudah di-redirect ke situ.
        $dashboardPermission = Permission::where('name', 'dashboard-view')->first();
        if ($dashboardPermission && !$role->hasPermissionTo($dashboardPermission)) {
            $role->givePermissionTo($dashboardPermission);
        }

        // User model men-cast 'password' => 'hashed', jadi cukup nilai polos
        // (auto di-hash saat disimpan) — Hash::make() manual di sini akan
        // menghasilkan double-hashing.
        $user = User::firstOrCreate(
            ['username' => 'CEE_Survey'],
            [
                'name' => 'Survei CEE (Akun Bersama)',
                'email' => 'cee-survey@mrkabar.local',
                'password' => '1234',
            ]
        );
        if (!$user->hasRole('cee-survey')) {
            $user->assignRole($role);
        }
    }
}
