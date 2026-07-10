<!DOCTYPE html>
<html>
<head>
    <title>Diagram Hierarki KRS IRS PD</title>
    <script>
        // Ikuti mode tampilan aplikasi induk (light / dark / system).
        // Kunci localStorage 'appearance' dipakai bersama karena iframe
        // satu origin dengan aplikasi induk.
        (function () {
            function applyAppearance() {
                try {
                    var stored = localStorage.getItem('appearance');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
                    document.documentElement.classList.toggle('dark', isDark);
                } catch (e) {
                    // localStorage/matchMedia tidak tersedia — biarkan terang.
                }
            }

            applyAppearance();

            window.addEventListener('storage', function (e) {
                if (!e || !e.key || e.key === 'appearance') applyAppearance();
            });

            if (window.matchMedia) {
                var mq = window.matchMedia('(prefers-color-scheme: dark)');
                if (typeof mq.addEventListener === 'function') {
                    mq.addEventListener('change', applyAppearance);
                } else if (typeof mq.addListener === 'function') {
                    mq.addListener(applyAppearance);
                }
            }
        })();
    </script>
    <link rel="stylesheet" href="{{ asset('css/hierarchy.css') }}">
</head>
<body>
    {{-- Halaman ini dimuat di dalam iframe pada halaman visualisasi;
         logo, judul, dan navigasi sudah disediakan layout aplikasi induk,
         jadi hanya isi card (kontrol, legenda, diagram) yang ditampilkan. --}}
    <div class="container">
        <div class="card">
            <div class="card-body">
                <div class="controls mb-3">
                    <div class="form-group">
                        <label for="mode">Mode Sorotan</label>
                        <select id="mode" class="form-control">
                            <option value="total">Gabungan</option>
                            <option value="ancestors">Tanjakan</option>
                            <option value="descendants">Turunan</option>
                        </select>
                    </div>
                    <button id="reset" class="btn btn-primary mt-2">Reset Sorotan</button>
                    <button id="zoomin" class="btn btn-warning mt-2" style="background-color:#fd7e14 !important; border-color:#d66a0f !important; color:#fff !important;">Zoom In</button>
                    <button id="zoomout" class="btn btn-warning mt-2" style="background-color:#fd7e14 !important; border-color:#d66a0f !important; color:#fff !important;">Zoom Out</button>
                    <button id="print" class="btn btn-info mt-2">Cetak Diagram</button>
                    <a href="{{ route('krs_irs_pd.index') }}" target="_top" class="btn btn-secondary mt-2">Lihat Tabel KRS_IRS_PD</a>
                </div>

                <div class="controls mb-3" style="align-items:center; position:relative; z-index:10000;">
                    <div class="form-group" style="flex:1; min-width:260px;">
                        <label for="hierarchy-search">Cari di Diagram</label>
                        <input type="text" id="hierarchy-search" class="form-control"
                               placeholder="Cari visi, misi, tujuan, sasaran, program, kegiatan, OPD, risiko... (Enter untuk cari/lanjut)">
                    </div>
                    <button id="hierarchy-search-btn" class="btn btn-primary mt-2">Cari</button>
                    <button id="hierarchy-search-prev" class="btn mt-2" style="background-color:#6c757d !important; border-color:#5c636a !important; color:#fff !important;">&uarr; Sebelumnya</button>
                    <button id="hierarchy-search-next" class="btn mt-2" style="background-color:#6c757d !important; border-color:#5c636a !important; color:#fff !important;">&darr; Berikutnya</button>
                    <button id="hierarchy-search-clear" class="btn mt-2" style="background-color:#6c757d !important; border-color:#5c636a !important; color:#fff !important;">Bersihkan</button>
                    <span id="search-status" class="mt-2" style="align-self:center; font-size:0.9rem; color:inherit; opacity:0.85;"></span>
                </div>

                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #ff9aa2;"></div>
                        <span>Visi</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #ffb7b2;"></div>
                        <span>Misi</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #ffdac1;"></div>
                        <span>Tujuan RPJMD / Tujuan Strategis PD</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #e2f0cb;"></div>
                        <span>Sasaran RPJMD / Sasaran Strategis PD</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #b5ead7;"></div>
                        <span>Program / Kegiatan / SubKegiatan PD</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #c7ceea;"></div>
                        <span>OPD Penanggung Jawab Kegiatan</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #a2d2ff;"></div>
                        <span>Risiko</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: linear-gradient(135deg, #ffd6e0 0%, #caffbf 35%, #a0c4ff 70%, #ffcfd2 100%);"></div>
                        <span>Atribut Risiko (mengikuti urutan kolom tabel)</span>
                    </div>
                </div>

                <div id="tree-container"></div>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/hierarchy.js') }}"></script>
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            const data = @json($hierarchyData);

            if (typeof initializeHierarchy === 'function') {
                try {
                    initializeHierarchy(data);
                } catch (error) {
                    console.error('Error initializing hierarchy:', error);
                    document.getElementById('tree-container').innerHTML =
                        '<div class="alert alert-danger">Error: ' + error.message + '</div>';
                }
            } else {
                console.error('Function initializeHierarchy not found!');
                document.getElementById('tree-container').innerHTML =
                    '<div class="alert alert-danger">Error: hierarchy.js not loaded correctly</div>';
            }
        });
        document.addEventListener('DOMContentLoaded', function() {
            const modeSelect = document.getElementById('mode');
            if (modeSelect) {
                modeSelect.addEventListener('change', function() {
                    if (typeof onModeChange === 'function') {
                        onModeChange(this.value);
                    }
                });
            }
            const zoomInBtn = document.getElementById('zoomin');
            const zoomOutBtn = document.getElementById('zoomout');
            if (zoomInBtn && zoomOutBtn) {
                zoomInBtn.addEventListener('click', function() {
                    if (typeof window.zoomHierarchy === 'function') window.zoomHierarchy(1.2);
                });
                zoomOutBtn.addEventListener('click', function() {
                    if (typeof window.zoomHierarchy === 'function') window.zoomHierarchy(0.9);
                });
            }
            const resetBtn = document.getElementById('reset');
            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    if (typeof window.resetHierarchyHighlight === 'function') window.resetHierarchyHighlight();
                });
            }
            const searchInput = document.getElementById('hierarchy-search');
            const searchBtn = document.getElementById('hierarchy-search-btn');
            const searchPrevBtn = document.getElementById('hierarchy-search-prev');
            const searchNextBtn = document.getElementById('hierarchy-search-next');
            const searchClearBtn = document.getElementById('hierarchy-search-clear');
            if (searchInput && searchBtn) {
                searchBtn.addEventListener('click', function() {
                    if (typeof window.hierarchySearchOrNext === 'function') window.hierarchySearchOrNext(searchInput.value);
                });
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.hierarchySearchOrNext === 'function') window.hierarchySearchOrNext(searchInput.value);
                    } else if (e.key === 'Escape') {
                        if (typeof window.clearHierarchySearch === 'function') window.clearHierarchySearch();
                        searchInput.value = '';
                    }
                });
            }
            if (searchPrevBtn) {
                searchPrevBtn.addEventListener('click', function() {
                    if (typeof window.hierarchySearchPrev === 'function') window.hierarchySearchPrev();
                });
            }
            if (searchNextBtn) {
                searchNextBtn.addEventListener('click', function() {
                    if (typeof window.hierarchySearchNext === 'function') window.hierarchySearchNext();
                });
            }
            if (searchClearBtn) {
                searchClearBtn.addEventListener('click', function() {
                    if (typeof window.clearHierarchySearch === 'function') window.clearHierarchySearch();
                    if (searchInput) searchInput.value = '';
                });
            }
            const printBtn = document.getElementById('print');
            if (printBtn) {
                printBtn.addEventListener('click', function() {
                    if (typeof window.printHierarchy === 'function') {
                        window.printHierarchy();
                    } else {
                        window.print();
                    }
                });
            }
        });
    </script>
</body>
</html>
