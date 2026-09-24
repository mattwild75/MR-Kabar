<?php

namespace App\Services\Graphify;

use App\Models\Menu;
use App\Support\Graphify\Pengetahuan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Graphify MR Kabar — peta pengetahuan (knowledge graph) seluruh aplikasi.
 *
 * Mengikuti konsep Graphify (ekstraksi → graf → komunitas → simpul utama →
 * laporan), tetapi ekstraksinya memahami susunan Laravel + Inertia: menu dan
 * izin dari basis data, rute beserta controller-nya, kelas PHP dan
 * ketergantungannya, relasi model Eloquent, tabel dan kunci asingnya,
 * halaman React dan impornya, perintah artisan dan jadwalnya, dokumen di
 * docs/, serta lapisan pengetahuan domain (regulasi dan konsep manajemen
 * risiko) dari App\Support\Graphify\Pengetahuan.
 *
 * Hasil disimpan di storage/app/graphify (graph.json, laporan.md,
 * meta.json) — tidak masuk git. Tidak memuat data pengguna, isi tabel,
 * .env, ataupun nilai konfigurasi.
 */
class GraphifyService
{
    public const DIR = 'graphify';

    /** Jenis simpul: label tampilan dan urutan tampil. */
    public const JENIS = [
        'modul' => 'Modul (menu utama)',
        'menu' => 'Menu',
        'izin' => 'Izin',
        'peran' => 'Peran',
        'rute' => 'Rute',
        'controller' => 'Controller',
        'middleware' => 'Middleware',
        'model' => 'Model',
        'tabel' => 'Tabel basis data',
        'layanan' => 'Layanan (Service)',
        'pendukung' => 'Pendukung (Support)',
        'perintah' => 'Perintah artisan',
        'kelas' => 'Kelas lain',
        'halaman' => 'Halaman React',
        'komponen' => 'Komponen React',
        'pustaka' => 'Pustaka JS (lib/hooks/layouts/types)',
        'dokumen' => 'Dokumen',
        'regulasi' => 'Regulasi',
        'konsep' => 'Konsep domain',
    ];

    /** Jenis "infrastruktur" yang tidak dihitung sebagai simpul utama. */
    private const INFRA = ['pustaka', 'izin', 'peran', 'middleware'];

    /** @var array<string, array<string, mixed>> */
    private array $nodes = [];

    /** @var array<string, array{source:string, target:string, rel:string}> */
    private array $links = [];

    /** Kelas PHP hasil pindai: fqcn => [file, ns, short, body, uses]. @var array<string, array<string, mixed>> */
    private array $kelas = [];

    private string $root;

    public function __construct()
    {
        $this->root = str_replace('\\', '/', base_path());
    }

    // ================================================================ publik

    /** Bangun ulang seluruh peta dan simpan. @return array<string, mixed> meta */
    public function bangun(): array
    {
        $mulai = microtime(true);
        $this->nodes = $this->links = $this->kelas = [];

        $this->pindaiKelasPhp();
        $this->tautanKelas();
        $this->modelDanTabel();
        $this->tabelBasisData();
        $this->ruteAplikasi();
        $this->menuIzinPeran();
        $this->halamanReact();
        $this->perintahDanJadwal();
        $this->dokumen();
        $this->pengetahuan();

        $graf = $this->rampungkan();
        $meta = [
            'dibangun' => now()->toIso8601String(),
            'durasi_detik' => round(microtime(true) - $mulai, 2),
            'simpul' => count($graf['nodes']),
            'relasi' => count($graf['links']),
            'komunitas' => count($graf['communities']),
            'versi' => 1,
            'commit' => $this->commitGit(),
        ];
        $graf['meta'] = $meta;

        $disk = Storage::disk('local');
        $disk->makeDirectory(self::DIR);
        $disk->put(self::DIR.'/graph.json', json_encode($graf, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $disk->put(self::DIR.'/laporan.md', $this->laporanMarkdown($graf));
        $disk->put(self::DIR.'/meta.json', json_encode($meta));

        return $meta;
    }

    /** @return array<string, mixed>|null */
    public function graf(): ?array
    {
        $isi = Storage::disk('local')->get(self::DIR.'/graph.json');

        return $isi ? json_decode($isi, true) : null;
    }

    /** @return array<string, mixed>|null */
    public function meta(): ?array
    {
        $isi = Storage::disk('local')->get(self::DIR.'/meta.json');

        return $isi ? json_decode($isi, true) : null;
    }

    public function laporan(): ?string
    {
        return Storage::disk('local')->get(self::DIR.'/laporan.md');
    }

    public function path(string $berkas): string
    {
        return Storage::disk('local')->path(self::DIR.'/'.$berkas);
    }

    // ================================================================ bantu

    /** @param array<string, mixed> $extra */
    private function node(string $id, string $label, string $type, array $extra = []): void
    {
        if (isset($this->nodes[$id])) {
            $this->nodes[$id] = array_replace($this->nodes[$id], array_filter($extra, fn ($v) => $v !== null && $v !== ''));

            return;
        }
        $this->nodes[$id] = ['id' => $id, 'label' => $label, 'type' => $type] + array_filter($extra, fn ($v) => $v !== null && $v !== '' && $v !== []);
    }

    private function link(string $a, string $b, string $rel): void
    {
        if ($a === $b) {
            return;
        }
        $this->links[$a.'|'.$b.'|'.$rel] = ['source' => $a, 'target' => $b, 'rel' => $rel];
    }

    private function relatif(string $path): string
    {
        $p = str_replace('\\', '/', $path);

        return ltrim(str_starts_with($p, $this->root) ? substr($p, strlen($this->root)) : $p, '/');
    }

    /** Ringkas docblock menjadi satu paragraf pendek. */
    private function ringkasDoc(string $doc): string
    {
        $baris = [];
        foreach (preg_split('/\R/', $doc) as $b) {
            $b = trim(preg_replace('#^\s*/?\*+/?#', '', $b));
            if ($b === '' && $baris !== []) {
                break;
            }
            if ($b === '' || str_starts_with($b, '@')) {
                continue;
            }
            $baris[] = $b;
        }
        $t = trim(implode(' ', $baris));

        return mb_strlen($t) > 420 ? mb_substr($t, 0, 417).'...' : $t;
    }

    // ================================================================ 1. kelas PHP

    private function jenisKelas(string $rel): string
    {
        return match (true) {
            str_starts_with($rel, 'app/Http/Controllers/') => 'controller',
            str_starts_with($rel, 'app/Http/Middleware/') => 'middleware',
            str_starts_with($rel, 'app/Models/') => 'model',
            str_starts_with($rel, 'app/Services/') => 'layanan',
            str_starts_with($rel, 'app/Support/') => 'pendukung',
            str_starts_with($rel, 'app/Console/Commands/') => 'perintah',
            default => 'kelas',
        };
    }

    private function pindaiKelasPhp(): void
    {
        foreach (File::allFiles(app_path()) as $f) {
            if ($f->getExtension() !== 'php') {
                continue;
            }
            $src = $f->getContents();
            if (! preg_match('/^namespace\s+([\w\\\\]+)\s*;/m', $src, $ns)
                || ! preg_match('/^(?:(?:final|abstract|readonly)\s+)*(class|trait|interface|enum)\s+(\w+)/m', $src, $kl, PREG_OFFSET_CAPTURE)) {
                continue;
            }
            $short = $kl[2][0];
            $fqcn = $ns[1].'\\'.$short;
            $posKelas = $kl[0][1];
            $kepala = substr($src, 0, $posKelas);
            $badan = substr($src, $posKelas);

            // Docblock tepat sebelum deklarasi kelas (boleh diselingi atribut).
            $desc = '';
            if (preg_match('#/\*\*((?:(?!\*/).)*)\*/\s*(?:\#\[[^\]]*\]\s*)*$#s', $kepala, $d)) {
                $desc = $this->ringkasDoc($d[1]);
            }

            $uses = [];
            if (preg_match_all('/^use\s+(App\\\\[\w\\\\]+)(?:\s+as\s+(\w+))?\s*;/m', $kepala, $m, PREG_SET_ORDER)) {
                foreach ($m as $u) {
                    $uses[$u[2] ?? class_basename($u[1])] = $u[1];
                }
            }
            $rel = $this->relatif($f->getPathname());
            $jenis = $this->jenisKelas($rel);
            if ($kl[1][0] === 'trait') {
                $jenis = 'kelas';
            }
            // Uraian tiap metode publik (docblock) — dipakai sebagai uraian rute.
            $metode = [];
            if (preg_match_all('#/\*\*((?:(?!\*/).)*)\*/\s*(?:\#\[[^\]]*\]\s*)*public\s+(?:static\s+)?function\s+(\w+)#s', $badan, $mm, PREG_SET_ORDER)) {
                foreach ($mm as $x) {
                    $metode[$x[2]] = $this->ringkasDoc($x[1]);
                }
            }
            $this->kelas[$fqcn] = ['file' => $rel, 'ns' => $ns[1], 'short' => $short, 'badan' => $badan, 'uses' => $uses, 'jenis' => $kl[1][0], 'metode' => $metode];

            $extra = ['file' => $rel, 'desc' => $desc, 'fqcn' => $fqcn, 'baris' => substr_count($src, "\n") + 1];
            if ($kl[1][0] !== 'class') {
                $extra['bentuk'] = $kl[1][0];
            }
            if (preg_match('/^abstract\s+class\s/m', $src)) {
                $extra['bentuk'] = 'abstract class';
            }
            $this->node('kelas:'.$fqcn, $short, $jenis, $extra);
        }
    }

    /** Ketergantungan antarkelas: use, pewarisan, trait, rujukan senamespace & FQCN. */
    private function tautanKelas(): void
    {
        $perNs = [];
        foreach ($this->kelas as $fqcn => $k) {
            $perNs[$k['ns']][$k['short']] = $fqcn;
        }

        foreach ($this->kelas as $fqcn => $k) {
            $dari = 'kelas:'.$fqcn;
            $badan = $k['badan'];
            $cari = function (string $nama) use ($k, $perNs): ?string {
                if (isset($k['uses'][$nama])) {
                    return $k['uses'][$nama];
                }

                return $perNs[$k['ns']][$nama] ?? null;
            };

            if (preg_match('/^(?:(?:final|abstract|readonly)\s+)*class\s+\w+\s+extends\s+([\w\\\\]+)/m', $badan, $e)) {
                $t = $cari(ltrim($e[1], '\\')) ?? (isset($this->kelas[ltrim($e[1], '\\')]) ? ltrim($e[1], '\\') : null);
                if ($t && isset($this->kelas[$t]) && $t !== 'App\Http\Controllers\Controller') {
                    $this->link($dari, 'kelas:'.$t, 'turunan dari');
                }
            }
            if (preg_match_all('/^\s{4}use\s+([\w\\\\,\s]+);/m', $badan, $tr)) {
                foreach ($tr[1] as $grup) {
                    foreach (array_map('trim', explode(',', $grup)) as $nama) {
                        $t = $cari($nama);
                        if ($t && isset($this->kelas[$t])) {
                            $this->link($dari, 'kelas:'.$t, 'memakai trait');
                        }
                    }
                }
            }
            $dipakai = [];
            foreach ($k['uses'] as $alias => $t) {
                if (isset($this->kelas[$t]) && preg_match('/(?<![\w$>\\\\])'.preg_quote($alias, '/').'\b/', $badan)) {
                    $dipakai[$t] = true;
                }
            }
            foreach ($perNs[$k['ns']] as $short => $t) {
                // Dipakai sebagai panggilan statis, tipe parameter, atau "new X(".
                if ($t !== $fqcn && preg_match('/(?<![\w$>\\\\])'.preg_quote($short, '/').'(?=::|\s+\$\w|\s*\()/', $badan)) {
                    $dipakai[$t] = true;
                }
            }
            if (preg_match_all('/\\\\?(App\\\\[\w\\\\]+)/', $badan, $fq)) {
                foreach ($fq[1] as $t) {
                    $t = rtrim($t, '\\');
                    if (isset($this->kelas[$t])) {
                        $dipakai[$t] = true;
                    }
                }
            }
            // Kelas dasar Controller dilewati: semua controller memakainya, tidak informatif.
            unset($dipakai['App\Http\Controllers\Controller']);
            foreach (array_keys($dipakai) as $t) {
                if ($t !== $fqcn) {
                    $this->link($dari, 'kelas:'.$t, 'memakai');
                }
            }
        }
    }

    // ================================================================ 2. model & tabel

    private function modelDanTabel(): void
    {
        $relasi = 'hasMany|belongsTo|hasOne|belongsToMany|hasManyThrough|hasOneThrough|morphMany|morphOne|morphTo|morphToMany|morphedByMany';
        foreach ($this->kelas as $fqcn => $k) {
            $dari = 'kelas:'.$fqcn;
            $badan = $k['badan'];

            if (($this->nodes[$dari]['type'] ?? '') === 'model' && $k['jenis'] === 'class' && class_exists($fqcn)) {
                try {
                    $ref = new \ReflectionClass($fqcn);
                    if ($ref->isSubclassOf(Model::class) && ! $ref->isAbstract()) {
                        /** @var Model $model */
                        $model = new $fqcn;
                        $tabel = $model->getTable();
                        $this->node('tabel:'.$tabel, $tabel, 'tabel');
                        $this->link($dari, 'tabel:'.$tabel, 'menyimpan di');
                        $this->nodes[$dari]['tabel'] = $tabel;
                    }
                } catch (\Throwable) {
                    // Model yang gagal dibuat tanpa argumen dilewati saja.
                }
            }

            if (preg_match_all('/function\s+(\w+)\s*\([^)]*\)[^{]*\{\s*return\s+\$this->('.$relasi.')\(\s*([\w\\\\]+)::class/', $badan, $m, PREG_SET_ORDER)) {
                foreach ($m as $r) {
                    $t = $k['uses'][$r[3]] ?? null;
                    if ($t === null) {
                        $t = isset($this->kelas[$k['ns'].'\\'.$r[3]]) ? $k['ns'].'\\'.$r[3] : ltrim($r[3], '\\');
                    }
                    if (isset($this->kelas[$t])) {
                        $this->link($dari, 'kelas:'.$t, $r[2].' ('.$r[1].')');
                    }
                }
            }

            // Kueri langsung ke tabel (DB::table, Schema) dari kelas mana pun.
            if (preg_match_all("/DB::table\(\s*'(\w+)'/", $badan, $q)) {
                foreach (array_unique($q[1]) as $t) {
                    $this->link($dari, 'tabel:'.$t, 'kueri langsung');
                }
            }
            if (preg_match_all("/Schema::(?:hasTable|table|create)\(\s*'(\w+)'/", $badan, $q)) {
                foreach (array_unique($q[1]) as $t) {
                    $this->link($dari, 'tabel:'.$t, 'memeriksa skema');
                }
            }
        }
    }

    private function tabelBasisData(): void
    {
        // Migrasi pembuat tiap tabel.
        $migrasi = [];
        foreach (File::files(database_path('migrations')) as $f) {
            if (preg_match_all("/Schema::create\(\s*'(\w+)'/", $f->getContents(), $m)) {
                foreach ($m[1] as $t) {
                    $migrasi[$t] ??= $f->getFilename();
                }
            }
        }

        // getTables() memuat tabel semua skema di server; ambil skema aplikasi saja.
        $skema = DB::connection()->getDatabaseName();
        foreach (Schema::getTables() as $t) {
            if (isset($t['schema']) && $t['schema'] !== $skema) {
                continue;
            }
            $nama = $t['name'];
            $kolom = [];
            try {
                $kolom = array_column(Schema::getColumns($nama), 'name');
            } catch (\Throwable) {
            }
            $this->node('tabel:'.$nama, $nama, 'tabel', [
                'kolom' => count($kolom),
                'daftar_kolom' => implode(', ', array_slice($kolom, 0, 60)),
                'ukuran_kb' => isset($t['size']) ? (int) round($t['size'] / 1024) : null,
                'migrasi' => $migrasi[$nama] ?? null,
                'desc' => $t['comment'] ?? null,
            ]);
            try {
                foreach (Schema::getForeignKeys($nama) as $fk) {
                    $this->link('tabel:'.$nama, 'tabel:'.$fk['foreign_table'], 'kunci asing ('.implode(',', $fk['columns']).')');
                }
            } catch (\Throwable) {
            }
        }
        // Tabel yang hanya dirujuk kode tetapi tidak ada di basis data tidak dibuatkan simpul.
    }

    // ================================================================ 3. rute

    private function ruteAplikasi(): void
    {
        $alias = app('router')->getMiddleware();
        $pakaiMw = [];
        $rute = Route::getRoutes()->getRoutes();
        foreach ($rute as $r) {
            foreach ($r->gatherMiddleware() as $mw) {
                $pakaiMw[is_string($mw) ? explode(':', $mw)[0] : 'closure'] = ($pakaiMw[is_string($mw) ? explode(':', $mw)[0] : 'closure'] ?? 0) + 1;
            }
        }
        $umum = array_keys(array_filter($pakaiMw, fn ($n) => $n > count($rute) * 0.4));

        foreach ($rute as $r) {
            $uri = '/'.ltrim($r->uri(), '/');
            if (str_starts_with($uri, '/_') || str_starts_with($uri, '/sanctum') || str_starts_with($uri, '/storage/')) {
                continue;
            }
            $metode = implode('|', array_diff($r->methods(), ['HEAD']));
            $id = 'rute:'.$metode.' '.$uri;
            $aksi = $r->getActionName();
            $uraian = null;
            if (str_contains($aksi, '@')) {
                [$kA, $mA] = explode('@', $aksi);
                $uraian = ($this->kelas[$kA]['metode'][$mA] ?? '') ?: null;
            }
            $this->node($id, $metode.' '.$uri, 'rute', ['uri' => $uri, 'nama_rute' => $r->getName(), 'aksi' => $aksi === 'Closure' ? 'closure' : class_basename(str_replace('@', '::', $aksi)), 'desc' => $uraian]);

            if (str_contains($aksi, '@')) {
                [$kelas, $metodeAksi] = explode('@', $aksi);
                if (isset($this->kelas[$kelas])) {
                    $this->link($id, 'kelas:'.$kelas, 'ditangani ('.$metodeAksi.')');
                }
            } elseif (class_exists($aksi) && isset($this->kelas[$aksi])) {
                $this->link($id, 'kelas:'.$aksi, 'ditangani (__invoke)');
            }
            foreach ($r->gatherMiddleware() as $mw) {
                if (! is_string($mw)) {
                    continue;
                }
                $nama = explode(':', $mw)[0];
                if (in_array($nama, $umum, true)) {
                    continue;
                }
                $kelas = $alias[$nama] ?? $nama;
                if (is_string($kelas) && isset($this->kelas[$kelas])) {
                    $this->link($id, 'kelas:'.$kelas, 'dijaga');
                }
            }
        }
    }

    // ================================================================ 4. menu, izin, peran

    private function menuIzinPeran(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }
        $menus = Menu::orderBy('order')->get(['id', 'title', 'parent_id', 'route', 'permission_name', 'icon', 'order']);
        $rute = array_filter($this->nodes, fn ($n) => $n['type'] === 'rute');

        foreach ($menus as $m) {
            $id = 'menu:'.$m->id;
            $this->node($id, trim($m->title), $m->parent_id ? 'menu' : 'modul', [
                'route' => $m->route && $m->route !== '#' ? $m->route : null,
                'ikon' => $m->icon,
                'izin' => $m->permission_name,
            ]);
            if ($m->parent_id) {
                $this->link('menu:'.$m->parent_id, $id, 'submenu');
            }
            if ($m->permission_name) {
                $this->node('izin:'.$m->permission_name, $m->permission_name, 'izin');
                $this->link($id, 'izin:'.$m->permission_name, 'butuh izin');
            }
            // Menu membuka rute GET yang cocok persis, dan (lemah) rute di bawah prefiksnya.
            if ($m->route && $m->route !== '#') {
                $path = '/'.ltrim(explode('?', $m->route)[0], '/');
                foreach ($rute as $rid => $n) {
                    if (str_starts_with($n['label'], 'GET') && ($n['uri'] === $path || preg_match($this->polaRute($n['uri']), $path))) {
                        $this->link($id, $rid, 'membuka');
                    } elseif (str_starts_with($n['uri'], rtrim($path, '/').'/')) {
                        $this->link($id, $rid, 'mencakup');
                    }
                }
            }
        }

        if (Schema::hasTable('roles')) {
            foreach (Role::with('permissions:id,name')->get() as $r) {
                $this->node('peran:'.$r->name, $r->name, 'peran', ['desc' => $r->name === 'super-admin' ? 'Lolos semua pengecekan izin (Gate::before).' : null]);
                foreach ($r->permissions as $p) {
                    $this->node('izin:'.$p->name, $p->name, 'izin');
                    $this->link('peran:'.$r->name, 'izin:'.$p->name, 'punya izin');
                }
            }
            foreach (Permission::all(['name', 'group']) as $p) {
                $this->node('izin:'.$p->name, $p->name, 'izin', ['grup' => $p->group]);
            }
        }
    }

    // ================================================================ 5. React

    private function jsId(string $rel): string
    {
        $r = preg_replace('/\.(tsx|ts|jsx|js)$/', '', $rel);

        return str_starts_with($r, 'resources/js/pages/') ? 'halaman:'.substr($r, strlen('resources/js/pages/')) : 'js:'.substr($r, strlen('resources/js/'));
    }

    private function halamanReact(): void
    {
        $akar = resource_path('js');
        if (! is_dir($akar)) {
            return;
        }
        $berkas = [];
        foreach (File::allFiles($akar) as $f) {
            if (! in_array($f->getExtension(), ['tsx', 'ts'], true) || str_ends_with($f->getFilename(), '.d.ts')) {
                continue;
            }
            $rel = $this->relatif($f->getPathname());
            $berkas[$rel] = $f->getContents();
        }

        foreach ($berkas as $rel => $src) {
            $id = $this->jsId($rel);
            $jenis = str_starts_with($id, 'halaman:') ? 'halaman' : (str_starts_with($rel, 'resources/js/components/') ? 'komponen' : 'pustaka');
            $label = str_starts_with($id, 'halaman:') ? substr($id, 8) : substr($id, 3);
            $desc = preg_match('#^\s*/\*\*((?:(?!\*/).)*)\*/#s', $src, $d) ? $this->ringkasDoc($d[1]) : null;
            $this->node($id, $label, $jenis, ['file' => $rel, 'desc' => $desc, 'baris' => substr_count($src, "\n") + 1]);
        }

        // Rute statis untuk mencocokkan URL literal di halaman.
        $rute = [];
        foreach ($this->nodes as $rid => $n) {
            if ($n['type'] === 'rute') {
                $statis = rtrim(explode('{', $n['uri'])[0], '/');
                $rute[] = [$rid, $n['uri'], $statis === '' ? '/' : $statis, str_contains($n['uri'], '{')];
            }
        }

        foreach ($berkas as $rel => $src) {
            $dari = $this->jsId($rel);
            $dir = dirname($rel);
            if (preg_match_all("/(?:from|import)\s*\(?\s*['\"]([^'\"]+)['\"]/", $src, $m)) {
                foreach (array_unique($m[1]) as $imp) {
                    if (str_starts_with($imp, '@/')) {
                        $dasar = 'resources/js/'.substr($imp, 2);
                    } elseif (str_starts_with($imp, '.')) {
                        $dasar = $this->normalPath($dir.'/'.$imp);
                    } else {
                        continue;
                    }
                    foreach (['', '.tsx', '.ts', '/index.tsx', '/index.ts'] as $akhiran) {
                        if (isset($berkas[$dasar.$akhiran])) {
                            $this->link($dari, $this->jsId($dasar.$akhiran), 'mengimpor');
                            break;
                        }
                    }
                }
            }
            // URL literal → rute (mis. fetch/href/router.visit).
            if (preg_match_all("/['\"`](\/[a-z0-9_\-\/]{2,})(?:['\"`?]|\\$\\{)/i", $src, $u)) {
                foreach (array_unique($u[1]) as $url) {
                    $url = rtrim($url, '/');
                    foreach ($rute as [$rid, $uri, $statis, $berparam]) {
                        if ($url === $uri || ($berparam && $url === $statis)) {
                            $this->link($dari, $rid, 'memanggil');
                        }
                    }
                }
            }
        }

        // Controller → halaman yang dirender.
        foreach ($this->kelas as $fqcn => $k) {
            if (preg_match_all("/(?:Inertia::render|inertia)\(\s*['\"]([^'\"]+)['\"]/", $k['badan'], $m)) {
                foreach (array_unique($m[1]) as $hal) {
                    if (isset($this->nodes['halaman:'.$hal])) {
                        $this->link('kelas:'.$fqcn, 'halaman:'.$hal, 'merender');
                    }
                }
            }
        }
    }

    /** Pola regex untuk URI rute berparameter, mis. pkpt/cetak/{formulir}. */
    private function polaRute(string $uri): string
    {
        $bagian = array_map(
            fn (string $s) => preg_match('/^\{\w+(\?)?\}$/', $s, $m) ? (isset($m[1]) ? '[^/]*' : '[^/]+') : preg_quote($s, '#'),
            explode('/', $uri),
        );

        return '#^'.implode('/', $bagian).'$#';
    }

    private function normalPath(string $p): string
    {
        $hasil = [];
        foreach (explode('/', $p) as $s) {
            if ($s === '..') {
                array_pop($hasil);
            } elseif ($s !== '.' && $s !== '') {
                $hasil[] = $s;
            }
        }

        return implode('/', $hasil);
    }

    // ================================================================ 6. perintah & jadwal

    private function perintahDanJadwal(): void
    {
        $perSignature = [];
        foreach ($this->kelas as $fqcn => $k) {
            if (preg_match("/protected\s+\\\$signature\s*=\s*['\"]([\w:\-]+)/", $k['badan'], $m)) {
                $perSignature[$m[1]] = $fqcn;
                $this->nodes['kelas:'.$fqcn]['perintah'] = 'php artisan '.$m[1];
            }
        }
        $console = base_path('routes/console.php');
        if (! is_file($console)) {
            return;
        }
        $src = File::get($console);
        $this->node('jadwal:penjadwal', 'Penjadwal (schedule:run)', 'konsep', ['desc' => 'Tugas berkala dari routes/console.php; berjalan bila cron memanggil php artisan schedule:run tiap menit.', 'file' => 'routes/console.php']);
        if (preg_match_all("/Schedule::command\(\s*'([\w:\-]+)[^']*'\s*\)([^;]*);/s", $src, $m, PREG_SET_ORDER)) {
            foreach ($m as $j) {
                $frek = preg_match_all('/->(\w+)\(([^)]*)\)/', $j[2], $f) ? implode(' ', array_map(fn ($a, $b) => $a.($b !== '' ? '('.$b.')' : ''), $f[1], $f[2])) : '';
                if (isset($perSignature[$j[1]])) {
                    $this->link('jadwal:penjadwal', 'kelas:'.$perSignature[$j[1]], 'menjadwalkan '.$frek);
                } else {
                    $this->node('perintah:'.$j[1], $j[1], 'perintah', ['desc' => 'Perintah bawaan paket/framework yang dijadwalkan.']);
                    $this->link('jadwal:penjadwal', 'perintah:'.$j[1], 'menjadwalkan '.$frek);
                }
            }
        }
    }

    // ================================================================ 7. dokumen

    private function dokumen(): void
    {
        $daftar = array_merge(glob(base_path('docs/*.md')) ?: [], glob(base_path('docs/*/*.md')) ?: [], [base_path('README.md')]);
        $kelasPendek = [];
        foreach ($this->kelas as $fqcn => $k) {
            if (strlen($k['short']) >= 8) {
                $kelasPendek[$k['short']][] = $fqcn;
            }
        }
        $tabel = array_keys(array_filter($this->nodes, fn ($n) => $n['type'] === 'tabel'));

        foreach ($daftar as $path) {
            if (! is_file($path)) {
                continue;
            }
            $rel = $this->relatif($path);
            // Daftar rute yang dihasilkan otomatis menyebut semua controller — tidak ditautkan.
            $tautkan = ! str_ends_with($rel, 'docs/RUTE.md');
            $src = File::get($path);
            $judul = preg_match('/^#\s+(.+)$/m', $src, $j) ? trim($j[1]) : basename($path);
            preg_match_all('/^#{2,3}\s+(.+)$/m', $src, $h);
            $paragraf = '';
            foreach (preg_split('/\R\s*\R/', $src) as $p) {
                $p = trim($p);
                if ($p !== '' && ! str_starts_with($p, '#') && ! str_starts_with($p, '```') && ! str_starts_with($p, '|')) {
                    $paragraf = mb_substr(preg_replace('/\s+/', ' ', $p), 0, 420);
                    break;
                }
            }
            $id = 'dok:'.$rel;
            $this->node($id, $judul, 'dokumen', ['file' => $rel, 'desc' => $paragraf, 'bagian' => array_slice(array_map('trim', $h[1]), 0, 40)]);

            foreach ($kelasPendek as $short => $fqcns) {
                if ($tautkan && count($fqcns) === 1 && str_contains($src, $short)) {
                    $this->link($id, 'kelas:'.$fqcns[0], 'membahas');
                }
            }
            foreach ($tabel as $tid) {
                $nama = substr($tid, 6);
                if ($tautkan && strlen($nama) >= 5 && preg_match('/`'.preg_quote($nama, '/').'`/', $src)) {
                    $this->link($id, $tid, 'membahas');
                }
            }
        }
    }

    // ================================================================ 8. pengetahuan domain

    private function pengetahuan(): void
    {
        foreach (Pengetahuan::simpul() as $s) {
            $this->node($s['id'], $s['label'], $s['type'], ['desc' => $s['desc'], 'sumber' => $s['sumber'] ?? null]);
        }
        foreach (Pengetahuan::simpul() as $s) {
            foreach ($s['tautan'] ?? [] as [$rel, $pilih]) {
                foreach ($this->pilih($pilih) as $tid) {
                    $this->link($s['id'], $tid, $rel);
                }
            }
        }
    }

    /**
     * Pemilih simpul untuk lapisan pengetahuan: ['id' => ...] persis, atau
     * ['type' => ..., 'label' => regex] / ['type' => ..., 'file' => regex].
     *
     * @param  array<string, string>  $p
     * @return list<string>
     */
    private function pilih(array $p): array
    {
        if (isset($p['id'])) {
            return isset($this->nodes[$p['id']]) ? [$p['id']] : [];
        }
        $hasil = [];
        foreach ($this->nodes as $id => $n) {
            if (isset($p['type']) && $n['type'] !== $p['type']) {
                continue;
            }
            if (isset($p['label']) && ! preg_match($p['label'], $n['label'])) {
                continue;
            }
            if (isset($p['file']) && ! preg_match($p['file'], $n['file'] ?? '')) {
                continue;
            }
            $hasil[] = $id;
            if (count($hasil) >= 40) {
                break;
            }
        }

        return $hasil;
    }

    // ================================================================ analisis

    /** @return array<string, mixed> */
    private function rampungkan(): array
    {
        $this->warisiUraian();

        // Buang relasi yang ujungnya tidak ada.
        $links = array_values(array_filter($this->links, fn ($l) => isset($this->nodes[$l['source']], $this->nodes[$l['target']])));
        $adj = [];
        foreach ($links as $l) {
            $adj[$l['source']][$l['target']] = true;
            $adj[$l['target']][$l['source']] = true;
        }
        $derajat = array_map('count', $adj);

        $komunitas = $this->propagasiLabel($adj, $derajat);
        $nodes = [];
        foreach ($this->nodes as $id => $n) {
            $n['degree'] = $derajat[$id] ?? 0;
            $n['community'] = $komunitas[$id] ?? -1;
            $nodes[] = $n;
        }

        // Nama komunitas: simpul domain berderajat tertinggi di dalamnya.
        $anggota = [];
        foreach ($nodes as $n) {
            if ($n['community'] >= 0) {
                $anggota[$n['community']][] = $n;
            }
        }
        $communities = [];
        foreach ($anggota as $c => $list) {
            usort($list, fn ($a, $b) => $this->bobotNama($b) <=> $this->bobotNama($a));
            $jenis = array_count_values(array_column($list, 'type'));
            arsort($jenis);
            $communities[] = [
                'id' => $c,
                'nama' => $list[0]['label'],
                'ukuran' => count($list),
                'jenis' => $jenis,
                'teratas' => array_map(fn ($n) => $n['id'], array_slice($list, 0, 8)),
            ];
        }
        usort($communities, fn ($a, $b) => $b['ukuran'] <=> $a['ukuran']);

        return [
            'nodes' => $nodes,
            'links' => $links,
            'communities' => $communities,
            'jenis' => self::JENIS,
            'temuan' => $this->temuan($nodes, $links),
        ];
    }

    /**
     * Simpul tanpa uraian mewarisi uraian tetangga yang paling mewakilinya:
     * menu dari rute yang dibukanya (atau controller rute itu), tabel dari
     * model penyimpannya.
     */
    private function warisiUraian(): void
    {
        $keluar = [];
        $masuk = [];
        foreach ($this->links as $l) {
            $keluar[$l['source']][] = $l;
            $masuk[$l['target']][] = $l;
        }
        foreach ($this->nodes as $id => $n) {
            if (! empty($n['desc'])) {
                continue;
            }
            $asal = null;
            if (in_array($n['type'], ['menu', 'modul'], true)) {
                foreach ($keluar[$id] ?? [] as $l) {
                    if ($l['rel'] === 'membuka') {
                        $rute = $this->nodes[$l['target']] ?? null;
                        $asal = $rute['desc'] ?? null;
                        foreach ($keluar[$l['target']] ?? [] as $l2) {
                            if (! $asal && str_starts_with($l2['rel'], 'ditangani')) {
                                $asal = $this->nodes[$l2['target']]['desc'] ?? null;
                            }
                        }
                    }
                }
            } elseif ($n['type'] === 'tabel') {
                foreach ($masuk[$id] ?? [] as $l) {
                    if ($l['rel'] === 'menyimpan di' && ! empty($this->nodes[$l['source']]['desc'])) {
                        $asal = 'Tabel model '.$this->nodes[$l['source']]['label'].': '.$this->nodes[$l['source']]['desc'];
                    }
                }
            }
            if ($asal) {
                $this->nodes[$id]['desc'] = $asal;
            }
        }
    }

    /** Commit git yang sedang berjalan (dibaca dari .git, tanpa menjalankan git). */
    private function commitGit(): ?string
    {
        $head = @file_get_contents(base_path('.git/HEAD'));
        if (! $head) {
            return null;
        }
        $head = trim($head);
        if (! str_starts_with($head, 'ref: ')) {
            return substr($head, 0, 7);
        }
        $ref = substr($head, 5);
        $isi = @file_get_contents(base_path('.git/'.$ref));
        if (! $isi && ($packed = @file_get_contents(base_path('.git/packed-refs')))) {
            foreach (explode("\n", $packed) as $b) {
                if (str_ends_with(trim($b), ' '.$ref)) {
                    $isi = explode(' ', trim($b))[0];
                }
            }
        }

        return $isi ? substr(trim($isi), 0, 7) : null;
    }

    /** @param array<string, mixed> $n */
    private function bobotNama(array $n): float
    {
        $prioritas = ['modul' => 6, 'menu' => 5, 'konsep' => 4.5, 'controller' => 4, 'model' => 3.5, 'layanan' => 3, 'halaman' => 2, 'tabel' => 2];

        return ($prioritas[$n['type']] ?? 0) * 1000 + $n['degree'];
    }

    /**
     * Komunitas lewat propagasi label (deterministik). Simpul hub (derajat
     * sangat tinggi) dan simpul infrastruktur tidak ikut menyebarkan label
     * agar modul tidak melebur jadi satu gumpalan.
     *
     * @param  array<string, array<string, bool>>  $adj
     * @param  array<string, int>  $derajat
     * @return array<string, int>
     */
    private function propagasiLabel(array $adj, array $derajat): array
    {
        $ids = array_keys($this->nodes);
        sort($ids);
        $label = array_flip($ids);
        $hub = fn (string $id) => ($derajat[$id] ?? 0) > 60 || in_array($this->nodes[$id]['type'], self::INFRA, true);

        for ($iter = 0; $iter < 40; $iter++) {
            $berubah = 0;
            foreach ($ids as $id) {
                if (empty($adj[$id])) {
                    continue;
                }
                $hitung = [];
                foreach (array_keys($adj[$id]) as $t) {
                    if ($hub($t)) {
                        continue;
                    }
                    $hitung[$label[$t]] = ($hitung[$label[$t]] ?? 0) + 1;
                }
                if ($hitung === []) {
                    continue;
                }
                $maks = max($hitung);
                $calon = array_keys(array_filter($hitung, fn ($v) => $v === $maks));
                $baru = in_array($label[$id], $calon, true) ? $label[$id] : min($calon);
                if ($baru !== $label[$id]) {
                    $label[$id] = $baru;
                    $berubah++;
                }
            }
            if ($berubah === 0) {
                break;
            }
        }
        // Nomori ulang 0..n urut ukuran; komunitas tunggal (terisolasi) = -1.
        $ukuran = array_count_values($label);
        arsort($ukuran);
        $nomor = [];
        foreach (array_keys($ukuran) as $i => $l) {
            $nomor[$l] = $ukuran[$l] > 1 ? $i : -1;
        }

        return array_map(fn ($l) => $nomor[$l], $label);
    }

    /**
     * Temuan pemeriksaan otomatis — bahan perapian, bukan kesalahan pasti.
     *
     * @param  list<array<string, mixed>>  $nodes
     * @param  list<array<string, string>>  $links
     * @return list<array{judul:string, penjelasan:string, simpul:list<string>}>
     */
    private function temuan(array $nodes, array $links): array
    {
        $masuk = $keluar = [];
        foreach ($links as $l) {
            $keluar[$l['source']][] = $l['rel'];
            $masuk[$l['target']][] = $l['rel'];
        }
        $per = fn (string $type, callable $syarat) => array_values(array_map(fn ($n) => $n['id'], array_filter($nodes, fn ($n) => $n['type'] === $type && $syarat($n))));

        $halamanPakai = fn ($n) => ! array_intersect($masuk[$n['id']] ?? [], ['merender', 'mengimpor']);
        $hasil = [
            ['judul' => 'Halaman React yang tidak dirender controller dan tidak diimpor', 'penjelasan' => 'Kemungkinan halaman lama yang tidak terpakai, atau dirender dengan nama dinamis.', 'simpul' => $per('halaman', $halamanPakai)],
            ['judul' => 'Komponen React yang tidak diimpor berkas mana pun', 'penjelasan' => 'Kandidat kode mati; periksa sebelum dihapus.', 'simpul' => $per('komponen', fn ($n) => empty($masuk[$n['id']]))],
            ['judul' => 'Tabel tanpa model Eloquent', 'penjelasan' => 'Tabel sistem/pivot atau diakses lewat DB::table.', 'simpul' => $per('tabel', fn ($n) => ! in_array('menyimpan di', $masuk[$n['id']] ?? [], true))],
            ['judul' => 'Controller tanpa rute', 'penjelasan' => 'Controller induk/trait, atau controller yang rutenya sudah dicabut.', 'simpul' => $per('controller', fn ($n) => ! preg_grep('/^ditangani/', $masuk[$n['id']] ?? []) && ($n['bentuk'] ?? 'class') === 'class' && $n['label'] !== 'Controller')],
            ['judul' => 'Layanan/pendukung yang tidak dipakai kelas lain', 'penjelasan' => 'Mungkin dipanggil lewat container/string, atau sudah tidak terpakai.', 'simpul' => array_merge(
                $per('layanan', fn ($n) => ! preg_grep('/^memakai/', $masuk[$n['id']] ?? [])),
                $per('pendukung', fn ($n) => ! preg_grep('/^memakai/', $masuk[$n['id']] ?? [])),
            )],
            ['judul' => 'Menu yang tidak menemukan rute GET yang cocok', 'penjelasan' => 'Tautan menu kemungkinan salah ketik atau rutenya sudah berubah.', 'simpul' => $per('menu', fn ($n) => isset($n['route']) && ! in_array('membuka', $keluar[$n['id']] ?? [], true))],
        ];

        return array_values(array_filter($hasil, fn ($t) => $t['simpul'] !== []));
    }

    // ================================================================ laporan

    /** @param array<string, mixed> $g */
    private function laporanMarkdown(array $g): string
    {
        $byId = array_column($g['nodes'], null, 'id');
        $jenis = array_count_values(array_column($g['nodes'], 'type'));
        $md = "# Laporan Graphify — MR Kabar\n\n";
        $md .= 'Dibangun: '.$g['meta']['dibangun'].(! empty($g['meta']['commit']) ? ' (commit '.$g['meta']['commit'].')' : '').' · '.$g['meta']['simpul'].' simpul · '.$g['meta']['relasi'].' relasi · '.$g['meta']['komunitas']." komunitas\n\n";
        $md .= "## Ringkasan per jenis\n\n| Jenis | Jumlah |\n|---|---|\n";
        foreach (self::JENIS as $k => $nama) {
            if (isset($jenis[$k])) {
                $md .= "| {$nama} | {$jenis[$k]} |\n";
            }
        }
        $utama = array_values(array_filter($g['nodes'], fn ($n) => ! in_array($n['type'], [...self::INFRA, 'komponen', 'rute', 'dokumen'], true)));
        usort($utama, fn ($a, $b) => $b['degree'] <=> $a['degree']);
        $md .= "\n## Simpul utama (paling banyak terhubung)\n\n";
        foreach (array_slice($utama, 0, 25) as $i => $n) {
            $md .= ($i + 1).'. **'.$n['label'].'** ('.(self::JENIS[$n['type']] ?? $n['type']).', '.$n['degree'].' relasi)'.(! empty($n['desc']) ? ' — '.mb_substr($n['desc'], 0, 160) : '')."\n";
        }
        $md .= "\n## Komunitas (kelompok yang saling terkait)\n\n";
        foreach (array_slice($g['communities'], 0, 40) as $c) {
            $md .= '- **'.$c['nama'].'** — '.$c['ukuran'].' simpul; teratas: '.implode(', ', array_map(fn ($id) => $byId[$id]['label'] ?? $id, array_slice($c['teratas'], 0, 6)))."\n";
        }
        $md .= "\n## Pengetahuan domain\n\n";
        foreach ($g['nodes'] as $n) {
            if (in_array($n['type'], ['regulasi', 'konsep'], true) && ! empty($n['desc'])) {
                $md .= '- **'.$n['label'].'** — '.$n['desc']."\n";
            }
        }
        $md .= "\n## Temuan pemeriksaan otomatis\n\n";
        foreach ($g['temuan'] as $t) {
            $md .= '### '.$t['judul'].' ('.count($t['simpul']).")\n\n".$t['penjelasan']."\n\n";
            foreach (array_slice($t['simpul'], 0, 60) as $id) {
                $md .= '- '.($byId[$id]['label'] ?? $id).(isset($byId[$id]['file']) ? ' — `'.$byId[$id]['file'].'`' : '')."\n";
            }
            $md .= "\n";
        }

        return $md;
    }
}
