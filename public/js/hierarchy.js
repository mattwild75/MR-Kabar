(function(window) {
    // Helper to create a level container div
    function createLevelDiv(level, container) {
        const div = document.createElement('div');
        div.className = 'level';
        div.dataset.level = level;
        container.appendChild(div);
        return div;
    }
    // Private variables
    const levelColors = [
        "#ff9aa2", // Level 0 - Visi
        "#ffb7b2", // Level 1 - Misi
        "#ffdac1", // Level 2 - Tujuan
        "#e2f0cb", // Level 3 - Sasaran
        "#b5ead7", // Level 4 - Program
        "#c7ceea", // Level 5 - OPD
        "#a2d2ff", // Level 6 - Risiko
        // Level 7+ — atribut/detail risiko (satu warna per kolom)
        "#ffd6e0", // Level 7  - Tingkat Risiko
        "#ffe5b4", // Level 8  - Tahun Dinilai Risiko
        "#fdffb6", // Level 9  - Jenis Risiko
        "#caffbf", // Level 10 - Entitas PD yang Menilai
        "#9bf6ff", // Level 11 - Nomor Urut Risiko
        "#a0c4ff", // Level 12 - Pemilik Risiko
        "#bdb2ff", // Level 13 - Uraian Penyebab Risiko
        "#ffc6ff", // Level 14 - Sumber Sebab Risiko
        "#e2ece9", // Level 15 - C/UC
        "#ffadad", // Level 16 - Uraian Dampak Risiko
        "#ffd6a5", // Level 17 - Pihak Terkena Dampak Risiko
        "#fbf8cc", // Level 18 - Pengendalian yang Sudah Ada
        "#b9fbc0", // Level 19 - Celah Pengendalian
        "#98f5e1", // Level 20 - Rencana Tindak Pengendalian
        "#8eecf5", // Level 21 - Pemilik Penanggungjawab
        "#90dbf4", // Level 22 - Target Waktu Penyelesaian
        "#a3c4f3", // Level 23 - Skala Risiko
        "#cfbaf0", // Level 24 - Skala Prioritas
        "#f1c0e8", // Level 25 - Skala Dampak
        "#ffcfd2"  // Level 26 - Skala Kemungkinan
    ];

    // Palet untuk level atribut risiko (7+) yang jumlahnya dinamis
    // mengikuti kolom tabel.
    const attrColors = levelColors.slice(7);

    let chartData = null;
    let zoomLevel = 1;

    // Terapkan zoom hanya pada area diagram. Transform tidak mengubah
    // ukuran layout, jadi wrapper diberi ukuran visual hasil skala agar
    // area scroll #tree-container selalu pas dengan diagram.
    function applyZoom() {
        const chartArea = document.getElementById('chart-area');
        const wrapper = document.getElementById('chart-scale-wrapper');
        if (!chartArea || !wrapper) return;
        chartArea.style.transform = `scale(${zoomLevel})`;
        chartArea.style.transformOrigin = '0 0';
        wrapper.style.width = (chartArea.offsetWidth * zoomLevel) + 'px';
        wrapper.style.height = (chartArea.offsetHeight * zoomLevel) + 'px';
    }

    // Fungsi zoom
    window.zoomHierarchy = function(factor) {
        zoomLevel = Math.max(0.2, Math.min(zoomLevel * factor, 5));
        applyZoom();
    };

    // Create chart and all its components (graph version)
    function createChart() {
        const treeContainer = document.getElementById('tree-container');
        if (!treeContainer || !chartData) return;

        treeContainer.innerHTML = '<div class="chart-scale-wrapper" id="chart-scale-wrapper"><div class="chart-area" id="chart-area"><svg class="connectors" id="connectors"></svg></div></div>';
        const chartArea = treeContainer.querySelector('.chart-area');

        // Group nodes by level
        const levels = {};
        chartData.nodes.forEach(node => {
            if (!levels[node.level]) levels[node.level] = [];
            levels[node.level].push(node);
        });

        // Create level containers
        Object.keys(levels).sort((a,b)=>a-b).forEach(level => {
            createLevelDiv(level, chartArea);
        });

        // Place nodes in their level
        chartData.nodes.forEach(node => {
            const levelDiv = document.querySelector(`.level[data-level="${node.level}"]`);
            createNodeDiv(node, node.level, levelDiv);
        });

        // Update SVG size after all nodes are created.
        // Pakai offsetWidth/offsetHeight (ukuran layout, bebas transform)
        // karena konektor digambar dalam koordinat tanpa skala.
        const svg = document.getElementById('connectors');
        svg.style.width = chartArea.offsetWidth + 'px';
        svg.style.height = chartArea.offsetHeight + 'px';

        // Draw connectors after size adjustment, lalu terapkan zoom
        // (menggambar harus terjadi saat skala masih 1:1).
        drawConnectors();
        applyZoom();
        centerOnVisi();
    }

    // Setiap kali diagram dibangun ulang (buka halaman, reset sorotan, ganti
    // mode), posisikan scroll horizontal supaya node VISI (akar pohon, di
    // tengah lebar total diagram) langsung terlihat di tengah viewport —
    // pengguna tidak perlu scroll manual untuk menemukan titik awal pohon.
    function centerOnVisi() {
        const container = document.getElementById('tree-container');
        const visiNode = document.querySelector('.node[data-level="0"]');
        if (!container || !visiNode) return;

        const nodeCenter = visiNode.offsetLeft + visiNode.offsetWidth / 2;
        container.scrollLeft = (nodeCenter * zoomLevel) - container.clientWidth / 2;

        // Level 0 (Visi) juga menjadi acuan vertikal "paling atas" secara
        // alami karena levelnya pertama dalam alur render — pastikan scroll
        // vertikal dimulai dari atas, bukan posisi tersisa dari render
        // sebelumnya.
        container.scrollTop = 0;
    }

    function createNodeDiv(node, level, container) {
        // Only create once per node id
        if (document.querySelector(`.node[data-id="${node.id}"]`)) return;
        const div = document.createElement('div');
        div.className = 'node';
        div.dataset.id = node.id;
        div.dataset.level = level;

        // Node struktural dikenali dari NAMA-nya (tetap sama di semua
        // diagram), bukan nomor level mentah — hierarchy.js dipakai bersama
        // oleh diagram KRS_Pemda (OPD level 5, Risiko level 6) dan KRS_PD
        // (OPD level 9, Risiko level 10, karena ada Kegiatan/SubKegiatan
        // tambahan di antara Program dan OPD), jadi nomor level untuk node
        // sejenis berbeda antar diagram dan tidak bisa dipakai langsung
        // sebagai indeks warna tetap. Node "atribut risiko" (tidak like
        // dikenali by name — kolom dinamis mengikuti skema tabel) tetap
        // dapat warna siklik dari attrColors berbasis nomor level mentah.
        const structuralColors = {
            VISI: levelColors[0], MISI: levelColors[1],
            'TUJUAN RPJMD': levelColors[2], 'TUJUAN STRATEGIS PD': levelColors[2],
            SASARAN: levelColors[3], 'SASARAN RPJMD': levelColors[3], 'SASARAN STRATEGIS PD': levelColors[3], 'SASARAN RENSTRA': levelColors[3],
            PROGRAM: levelColors[4], 'PROGRAM PD': levelColors[4],
            'KEGIATAN PD': levelColors[4], 'SUBKEGIATAN PD': levelColors[4],
            OPD: levelColors[5],
            RISIKO: levelColors[6],
        };
        let headerColor = structuralColors[node.name] || attrColors[level % attrColors.length];
        let label = node.name;
        if (node.name === 'OPD') {
            label = 'OPD Penanggung Jawab';
        }

        // Program NON-PRIORITAS (is_prioritas === false): program yang TIDAK
        // menurun dari Sasaran RPJMD (mis. Program Pengembangan Kurikulum, atau
        // program level Kecamatan di Tabel 4.1). Dibedakan visualnya — warna
        // abu-abu + kelas .node-non-prioritas + badge — supaya di antara
        // sederet PROGRAM PD terlihat mana yang prioritas dan mana yang bukan.
        const isNonPrioritas = node.is_prioritas === false;
        if (isNonPrioritas) {
            headerColor = '#6b7280'; // abu-abu netral
            div.classList.add('node-non-prioritas');
        } else if (node.name === 'PROGRAM PD' && node.is_prioritas === true) {
            div.classList.add('node-prioritas');
        }

        // Tombol info
        const infoBtn = document.createElement('button');
        infoBtn.className = 'node-info-btn';
        infoBtn.innerHTML = '\u2139\ufe0f';
        infoBtn.title = 'Lihat detail';
        infoBtn.onclick = function(e) {
            e.stopPropagation();
            showNodeDetail(node);
        };

        // Badge kecil "NON-PRIORITAS" di header, hanya untuk program menggantung.
        const badge = isNonPrioritas
            ? '<span class="node-badge-np">NON-PRIORITAS</span>'
            : '';

        div.innerHTML = `
            <div class="node-header" style="background-color: ${headerColor}">${label}${badge}</div>
            <div class="node-value">${node.value}</div>
        `;
        div.querySelector('.node-header').appendChild(infoBtn);

        div.addEventListener('click', () => highlightNode(node.id));
        container.appendChild(div);
    }

    // Pecah nilai berformat "Label kode :\n> a\n> b" ATAU "> a\n> b" (dua-duanya
    // dipakai backend tergantung field) menjadi array baris polos ["a", "b"],
    // supaya bisa dirender sejajar sebagai tabel alih-alih satu baris teks
    // panjang. Baris yang tidak diawali "> " dianggap baris label judul dan
    // dibuang — bukan diasumsikan selalu baris pertama.
    function parseIkLines(value) {
        if (!value) return [];
        return String(value)
            .split('\n')
            .filter(line => /^>\s*/.test(line.trim()))
            .map(line => line.trim().replace(/^>\s*/, '').trim())
            .filter(line => line !== '');
    }

    // Escape teks untuk aman disisipkan ke dalam HTML (mencegah XSS dari
    // data pengguna yang tersimpan di node — mis. uraian risiko/dampak).
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Bungkus semua kemunculan `query` (case-insensitive) di dalam `text`
    // dengan <mark>, dengan teks di-escape terlebih dahulu supaya aman
    // disisipkan sebagai HTML. Dipakai untuk menyorot hasil pencarian di
    // dalam popup detail node — search box hanya menyaring/menyorot NODE,
    // bukan teks di dalam popup, jadi tanpa ini pengguna tidak akan melihat
    // di mana persisnya kata kunci itu berada begitu popup terbuka.
    function highlightMatchInHtml(text, query) {
        const escaped = escapeHtml(text);
        if (!query) return escaped;
        const q = escapeHtml(query);
        const idx = escaped.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return escaped;
        return escaped.slice(0, idx) + '<mark>' + escaped.slice(idx, idx + q.length) + '</mark>' + escaped.slice(idx + q.length);
    }

    // Modal untuk info node. `searchQuery` opsional — bila diisi (dipanggil
    // dari alur pencarian), setiap field yang cocok disorot dengan <mark>
    // supaya pengguna langsung melihat di baris mana kata kunci itu berada,
    // karena label pada kotak node sendiri sering hanya cuplikan singkat
    // dan detail lengkapnya cuma tersedia di dalam popup ini.
    function showNodeDetail(node, searchQuery) {
        const q = searchQuery || '';
        let html = `<h4>Detail ${highlightMatchInHtml(node.name, q)}</h4>`;

        // Urutan tampilan: VALUE (nama/isi node) DULU di atas, baru detail
        // indikator (tabel) di bawahnya. Keduanya dirakit terpisah lalu
        // digabung dengan urutan tersebut di akhir fungsi.
        let tableHtml = '';
        let listHtml = '';

        // IK/Baseline/Target/OPD dirender sebagai tabel bertingkat (satu baris
        // per indikator) bila node punya salah satu dari field ini — jauh
        // lebih mudah dibaca dibanding satu baris teks panjang dipisah ">".
        if (node.ik || node.baseline_ik || node.target_ik || node.opd_ik) {
            const ikLines = parseIkLines(node.ik);
            const baselineLines = parseIkLines(node.baseline_ik);
            const targetLines = parseIkLines(node.target_ik);
            const opdLines = parseIkLines(node.opd_ik);
            const rowCount = Math.max(ikLines.length, baselineLines.length, targetLines.length, opdLines.length, 1);

            // OPD berlaku untuk SELURUH program/subkegiatan (bukan per-indikator).
            // Jika hanya ada 1 OPD tapi indikatornya banyak, tampilkan OPD yang
            // SAMA di semua baris — bukan kosong di baris 2 dst. Kalau OPD-nya
            // memang banyak (berpasangan per baris), biarkan apa adanya.
            const opdFor = (i) => opdLines.length === 1 ? opdLines[0] : (opdLines[i] ?? '');

            tableHtml += `
                <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:13px;">
                    <thead>
                        <tr style="border-bottom:1px solid #ccc;">
                            <th style="text-align:left;padding:4px 8px;">Indikator</th>
                            <th style="text-align:left;padding:4px 8px;">Baseline</th>
                            <th style="text-align:left;padding:4px 8px;">Target</th>
                            <th style="text-align:left;padding:4px 8px;">OPD</th>
                        </tr>
                    </thead>
                    <tbody>`;
            for (let i = 0; i < rowCount; i++) {
                tableHtml += `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:4px 8px;">${highlightMatchInHtml(ikLines[i] ?? '', q)}</td>
                            <td style="padding:4px 8px;">${highlightMatchInHtml(baselineLines[i] ?? '', q)}</td>
                            <td style="padding:4px 8px;">${highlightMatchInHtml(targetLines[i] ?? '', q)}</td>
                            <td style="padding:4px 8px;">${highlightMatchInHtml(opdFor(i), q)}</td>
                        </tr>`;
            }
            tableHtml += '</tbody></table>';
        }

        listHtml += '<ul style="list-style:none;padding:0;margin:0 0 12px;">';
        for (const key in node) {
            if (['id','name','children','level','ik','baseline_ik','target_ik','opd_ik'].includes(key)) continue;
            if (node[key] && typeof node[key] !== 'object') {
                // sumber_sebab_risiko_uraian/c_uc_uraian bisa berisi beberapa
                // baris (satu per variasi uraian untuk kategori yang sama,
                // lihat splitSumberSebabRisiko()/splitCUc() di backend) —
                // tampilkan sebagai daftar bullet, bukan satu baris teks
                // panjang dengan "\n" literal yang tidak akan wrap di HTML.
                if (key === 'sumber_sebab_risiko_uraian' || key === 'c_uc_uraian') {
                    const lines = String(node[key]).split('\n').filter(l => l.trim() !== '');
                    if (lines.length === 0) continue;
                    const items = lines.map(l => `<li style="margin-left:16px;">${highlightMatchInHtml(l, q)}</li>`).join('');
                    listHtml += `<li><b>URAIAN</b><ul style="list-style:disc;padding:0;margin:4px 0;">${items}</ul></li>`;
                    continue;
                }
                listHtml += `<li><b>${escapeHtml(key.replace(/_/g,' ').toUpperCase())}</b>: ${highlightMatchInHtml(node[key], q)}</li>`;
            }
        }
        listHtml += '</ul>';

        // Gabung: VALUE (listHtml) di ATAS, detail indikator (tableHtml) di BAWAH.
        html += listHtml + tableHtml;
        let modal = document.getElementById('node-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'node-detail-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.3)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '9999';
            // Warna solid & theme-aware supaya SELALU terbaca (light: kotak
            // putih teks gelap; dark: kotak gelap teks terang) — tidak tembus
            // background diagram. Kelas node-detail-box distyle di hierarchy.css.
            modal.innerHTML = `<div id="node-detail-box" class="node-detail-box" style="padding:24px 32px;border-radius:10px;min-width:320px;max-width:90vw;max-height:80vh;overflow:auto;position:relative;box-shadow:0 12px 40px rgba(0,0,0,0.4);">
                <button id="close-node-detail-modal" aria-label="Tutup" style="position:absolute;top:8px;right:8px;width:32px;height:32px;line-height:1;font-size:22px;font-weight:700;color:#374151;background:#e5e7eb;border:none;border-radius:8px;cursor:pointer;">&times;</button>
                <div id="node-detail-content"></div>
            </div>`;
            document.body.appendChild(modal);

            const closeModal = () => { modal.style.display = 'none'; };

            // 1) Tombol ×
            modal.querySelector('#close-node-detail-modal').onclick = closeModal;
            // 2) Klik di area gelap (overlay) di luar kotak → tutup
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
            // 3) Tombol Escape → tutup
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
            });
        }
        modal.style.display = 'flex';
        modal.querySelector('#node-detail-content').innerHTML = html;
    }

    function drawConnectors() {
        const svg = document.getElementById('connectors');
        if (!svg || !chartData) return;
        svg.innerHTML = '';
        // Draw all edges
        chartData.edges.forEach(edge => {
            const parentEl = document.querySelector(`.node[data-id="${edge.from}"]`);
            const childEl = document.querySelector(`.node[data-id="${edge.to}"]`);
            if (!parentEl || !childEl) return;
            const chartRect = document.querySelector('.chart-area').getBoundingClientRect();
            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentRect.left + parentRect.width/2 - chartRect.left);
            line.setAttribute('y1', parentRect.bottom - chartRect.top);
            line.setAttribute('x2', childRect.left + childRect.width/2 - chartRect.left);
            line.setAttribute('y2', childRect.top - chartRect.top);
            line.setAttribute('class', 'connector');
            line.setAttribute('data-parent', edge.from);
            line.setAttribute('data-child', edge.to);
            svg.appendChild(line);
        });
    }

    // Versi cetak: koordinat dihitung dari posisi UNSCALED (chartArea
    // tanpa zoom/transform apa pun) dikalikan manual dengan `scale`,
    // BUKAN dari getBoundingClientRect() setelah CSS zoom diterapkan.
    // CSS "zoom" bukan properti standar dan cara mesin render cetak
    // (yang menghasilkan file PDF) memprosesnya bisa sedikit berbeda
    // dari cara browser me-reflow tampilan layar biasa — menghitung
    // manual dari matematika (posisi asli × skala) menghindari
    // ketidaksesuaian itu sepenuhnya, karena tidak bergantung pada
    // apakah/kapan browser sudah menerapkan zoom secara visual.
    function drawConnectorsScaled(scale) {
        const svg = document.getElementById('connectors');
        const chartArea = document.getElementById('chart-area');
        if (!svg || !chartData || !chartArea) return;
        svg.innerHTML = '';

        // Lepas transform DAN zoom sementara (inline style menang atas
        // class CSS "printing-hierarchy" yang menerapkan zoom lewat
        // var(--print-scale)) — supaya getBoundingClientRect() di bawah
        // benar-benar membaca posisi 1:1 natural, bukan hasil zoom.
        const prevTransform = chartArea.style.transform;
        const prevZoom = chartArea.style.zoom;
        chartArea.style.transform = 'none';
        chartArea.style.zoom = '1';
        void chartArea.offsetHeight; // paksa reflow sebelum mengukur
        const chartRect = chartArea.getBoundingClientRect();

        chartData.edges.forEach(edge => {
            const parentEl = document.querySelector(`.node[data-id="${edge.from}"]`);
            const childEl = document.querySelector(`.node[data-id="${edge.to}"]`);
            if (!parentEl || !childEl) return;
            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();
            // Lewati node yang belum benar-benar ter-render/ter-layout
            // (rect kosong) — menggambar garis dari koordinat 0,0 akan
            // menghasilkan garis "liar" yang melenceng jauh dari diagram.
            if (parentRect.width === 0 || childRect.width === 0) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', (parentRect.left + parentRect.width / 2 - chartRect.left) * scale);
            line.setAttribute('y1', (parentRect.bottom - chartRect.top) * scale);
            line.setAttribute('x2', (childRect.left + childRect.width / 2 - chartRect.left) * scale);
            line.setAttribute('y2', (childRect.top - chartRect.top) * scale);
            line.setAttribute('class', 'connector');
            line.setAttribute('data-parent', edge.from);
            line.setAttribute('data-child', edge.to);
            svg.appendChild(line);
        });

        chartArea.style.transform = prevTransform;
        chartArea.style.zoom = prevZoom;
    }

    // Kunci baris asal dari sebuah edge. Backend mengirim 'rows' sebagai
    // objek map (mis. {"0": true, "5": true}) karena di-JSON-encode dari
    // associative array PHP — di sini dinormalisasi jadi Set of number.
    function edgeRowSet(edge) {
        if (!edge.rows) return new Set();
        return new Set(Object.keys(edge.rows).map(Number));
    }

    function intersect(setA, setB) {
        const result = new Set();
        setA.forEach(v => { if (setB.has(v)) result.add(v); });
        return result;
    }

    function highlightNode(nodeId) {
        const mode = document.getElementById('mode').value;
        resetHighlight();
        const clickedNode = document.querySelector(`.node[data-id="${nodeId}"]`);
        if (clickedNode) {
            clickedNode.classList.add('highlighted');
            // Baris konteks awal = gabungan semua baris dari edge manapun
            // yang menyentuh node yang diklik (sebagai parent atau child).
            // Node yang digabung (dedup by value) bisa menjadi milik banyak
            // baris tabel sekaligus — traversal berikutnya akan mempersempit
            // konteks ini seiring naik/turun, sehingga jalur yang ditelusuri
            // tetap konsisten dengan satu (atau beberapa) baris data asli,
            // bukan menyebar ke rantai lain yang kebetulan bertemu di sini.
            const contextRows = new Set();
            chartData.edges.forEach(edge => {
                if (edge.from === nodeId || edge.to === nodeId) {
                    edgeRowSet(edge).forEach(r => contextRows.add(r));
                }
            });
            if (mode === 'ancestors') {
                highlightAncestors(nodeId, contextRows);
            } else if (mode === 'descendants') {
                highlightDescendants(nodeId, contextRows);
            } else if (mode === 'total') {
                highlightAncestors(nodeId, contextRows);
                highlightDescendants(nodeId, contextRows);
            }
        }
    }

    // Guard anti-loop dikunci per (node, baris) — bukan per node saja.
    // Node gabungan bisa dikunjungi lewat lebih dari satu konteks baris
    // (mis. RISIKO yang sama persis muncul di 2 baris tabel berbeda);
    // masing-masing baris tetap berhak ditelusuri sampai ujungnya sendiri.
    function visitKey(nodeId, rows) {
        return nodeId + '::' + Array.from(rows).sort((a, b) => a - b).join(',');
    }

    function highlightAncestors(nodeId, contextRows, visited = new Set()) {
        const key = visitKey(nodeId, contextRows);
        if (visited.has(key)) return;
        visited.add(key);
        // Find all edges where to = nodeId AND yang berbagi baris asal
        // dengan konteks yang sedang ditelusuri.
        chartData.edges.forEach(edge => {
            if (edge.to !== nodeId) return;
            const sharedRows = intersect(edgeRowSet(edge), contextRows);
            if (sharedRows.size === 0) return;

            const parentId = edge.from;
            const parentNode = document.querySelector(`.node[data-id="${parentId}"]`);
            const connector = document.querySelector(`.connector[data-parent="${parentId}"][data-child="${nodeId}"]`);
            if (parentNode && connector) {
                parentNode.classList.add('highlighted-path');
                connector.classList.add('highlighted-path');
                highlightAncestors(parentId, sharedRows, visited);
            }
        });
    }

    function highlightDescendants(nodeId, contextRows, visited = new Set()) {
        const key = visitKey(nodeId, contextRows);
        if (visited.has(key)) return;
        visited.add(key);
        // Find all edges where from = nodeId AND yang berbagi baris asal
        // dengan konteks yang sedang ditelusuri.
        chartData.edges.forEach(edge => {
            if (edge.from !== nodeId) return;
            const sharedRows = intersect(edgeRowSet(edge), contextRows);
            if (sharedRows.size === 0) return;

            const childId = edge.to;
            const childEl = document.querySelector(`.node[data-id="${childId}"]`);
            const connector = document.querySelector(`.connector[data-parent="${nodeId}"][data-child="${childId}"]`);
            if (childEl && connector) {
                childEl.classList.add('highlighted-path');
                connector.classList.add('highlighted-path');
                highlightDescendants(childId, sharedRows, visited);
            }
        });
    }

    function resetHighlight() {
        document.querySelectorAll('.node, .connector').forEach(el => {
            el.classList.remove('highlighted', 'highlighted-path');
        });
    }

    // ===== Pencarian & sorot node =====
    // Berbeda dari highlightNode() (menyorot jalur ancestor/descendant dari
    // SATU node yang diklik), fitur ini mencari lintas SELURUH data node
    // (bukan cuma teks yang tampak di label kotak, yang sering berupa
    // cuplikan singkat) — field lengkap seperti uraian risiko/dampak/
    // pengendalian hanya muncul di dalam popup showNodeDetail, jadi
    // pencarian harus membaca data node itu sendiri, bukan DOM/teks
    // terlihat, supaya kata kunci yang hanya ada di detail popup tetap
    // ditemukan.
    let searchMatches = [];
    let searchCurrentIndex = -1;
    let searchQuery = '';

    function nodeMatchesQuery(node, q) {
        for (const key in node) {
            if (['id', 'children', 'level'].includes(key)) continue;
            const val = node[key];
            if (val && typeof val !== 'object' && String(val).toLowerCase().includes(q)) {
                return true;
            }
        }
        return false;
    }

    function runHierarchySearch(query) {
        searchQuery = (query || '').trim().toLowerCase();
        document.querySelectorAll('.node').forEach(el => el.classList.remove('search-match', 'search-current'));

        if (!searchQuery || !chartData) {
            searchMatches = [];
            searchCurrentIndex = -1;
            updateSearchStatus();
            return;
        }

        searchMatches = chartData.nodes.filter(n => nodeMatchesQuery(n, searchQuery)).map(n => n.id);
        searchMatches.forEach(id => {
            const el = document.querySelector(`.node[data-id="${id}"]`);
            if (el) el.classList.add('search-match');
        });
        searchCurrentIndex = searchMatches.length > 0 ? 0 : -1;
        updateSearchStatus();
        if (searchCurrentIndex >= 0) goToSearchMatch(searchCurrentIndex);
    }

    function goToSearchMatch(index) {
        if (searchMatches.length === 0) return;
        const wrapped = ((index % searchMatches.length) + searchMatches.length) % searchMatches.length;
        searchCurrentIndex = wrapped;
        updateSearchStatus();

        document.querySelectorAll('.node').forEach(el => el.classList.remove('search-current'));
        const nodeId = searchMatches[wrapped];
        const el = document.querySelector(`.node[data-id="${nodeId}"]`);
        if (!el) return;
        el.classList.add('search-current');

        // Scroll node hasil ke TENGAH viewport. chart-area di-scale via
        // transform (lihat applyZoom), jadi scrollIntoView bawaan salah
        // menghitung posisi. Hitung manual: posisi node RELATIF ke chart-area
        // (via getBoundingClientRect, bukan offsetLeft yang bisa keliru
        // offsetParent), lalu kalikan zoomLevel karena wrapper ukurannya
        // ter-scale.
        const container = document.getElementById('tree-container');
        const chartArea = document.getElementById('chart-area');
        if (container && chartArea) {
            const cRect = chartArea.getBoundingClientRect();
            const eRect = el.getBoundingClientRect();
            // Posisi tengah node dalam koordinat chart-area TER-SCALE (rect
            // sudah memperhitungkan scale), relatif ke ujung kiri-atas chart.
            const nodeCenterX = (eRect.left - cRect.left) + eRect.width / 2;
            const nodeCenterY = (eRect.top - cRect.top) + eRect.height / 2;
            container.scrollTo({
                left: nodeCenterX - container.clientWidth / 2,
                top: nodeCenterY - container.clientHeight / 2,
                behavior: 'smooth',
            });
        }

        // Saat menuju hasil pencarian: cukup SOROT + scroll ke node (node
        // sudah ter-highlight di diagram), TANPA membuka popup detail — biar
        // pengguna langsung melihat node hasil pada diagram, bukan tertutup
        // popup. Detail tetap bisa dibuka manual lewat tombol info (ℹ️) node.
    }

    function searchNext() { if (searchCurrentIndex >= 0) goToSearchMatch(searchCurrentIndex + 1); }
    function searchPrev() { if (searchCurrentIndex >= 0) goToSearchMatch(searchCurrentIndex - 1); }

    // Dipanggil dari tombol "Cari" dan tombol Enter: bila query sama
    // dengan pencarian yang sedang aktif, lanjut ke hasil berikutnya
    // (seperti menekan Enter berulang kali di Ctrl+F browser) — bukan
    // mengulang pencarian dari awal (yang hanya akan kembali ke hasil
    // pertama setiap kali).
    function searchOrNext(query) {
        const q = (query || '').trim().toLowerCase();
        if (q === searchQuery && searchMatches.length > 0) {
            searchNext();
        } else {
            runHierarchySearch(query);
        }
    }

    function clearHierarchySearch() {
        searchQuery = '';
        searchMatches = [];
        searchCurrentIndex = -1;
        document.querySelectorAll('.node').forEach(el => el.classList.remove('search-match', 'search-current'));
        updateSearchStatus();
    }

    function updateSearchStatus() {
        const status = document.getElementById('search-status');
        if (!status) return;
        if (!searchQuery) {
            status.textContent = '';
        } else if (searchMatches.length === 0) {
            status.textContent = `Tidak ada hasil untuk "${searchQuery}".`;
        } else {
            status.textContent = `${searchCurrentIndex + 1} / ${searchMatches.length} hasil untuk "${searchQuery}".`;
        }

        // Sinkronkan floating window setiap kali status berubah (jalur search
        // baru, pindah hasil prev/next, dan clear semua lewat sini).
        renderSearchResultsWindow();
    }

    // ==========================================================================
    // Floating window "Hasil Pencarian" — panel non-modal yang bisa di-drag,
    // tetap terbuka di atas diagram (tidak menutupi penuh) supaya pengguna
    // dapat melihat daftar seluruh hasil sekaligus sambil menelusuri diagram
    // di bawahnya. Punya tombol close (×) di kanan atas. Muncul otomatis saat
    // pencarian menghasilkan minimal satu match, dan menyembunyikan diri saat
    // pencarian dibersihkan / tidak ada hasil.
    // ==========================================================================
    let searchResultsWindow = null;
    let searchWindowManuallyClosed = false;

    function buildSearchResultsWindow() {
        if (searchResultsWindow) return searchResultsWindow;

        const win = document.createElement('div');
        win.id = 'search-results-window';
        win.style.cssText = [
            'position:fixed', 'top:80px', 'right:24px', 'width:320px',
            'max-height:60vh', 'display:none', 'flex-direction:column',
            'background:var(--sr-bg,#fff)', 'color:var(--sr-fg,#1f2937)',
            'border:1px solid rgba(0,0,0,0.15)', 'border-radius:10px',
            'box-shadow:0 10px 40px rgba(0,0,0,0.25)', 'z-index:2147483000',
            'font-family:inherit', 'font-size:13px', 'overflow:hidden',
        ].join(';');

        // Warna adaptif light/dark (iframe ikut kelas .dark dari induk).
        if (document.documentElement.classList.contains('dark')) {
            win.style.setProperty('--sr-bg', '#1f2937');
            win.style.setProperty('--sr-fg', '#e5e7eb');
        }

        const header = document.createElement('div');
        header.id = 'search-results-window-header';
        header.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:space-between',
            'gap:8px', 'padding:10px 12px', 'cursor:move', 'user-select:none',
            'background:var(--primary,#0ea5e9)', 'color:#fff', 'font-weight:600',
        ].join(';');

        const titleEl = document.createElement('span');
        titleEl.id = 'search-results-window-title';
        titleEl.textContent = 'Hasil Pencarian';
        titleEl.style.cssText = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Tutup');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = [
            'flex:0 0 auto', 'width:24px', 'height:24px', 'line-height:1',
            'border:none', 'border-radius:6px', 'cursor:pointer',
            'background:rgba(255,255,255,0.2)', 'color:#fff',
            'font-size:18px', 'font-weight:700',
        ].join(';');
        closeBtn.addEventListener('click', function () {
            searchWindowManuallyClosed = true;
            win.style.display = 'none';
        });

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        const list = document.createElement('div');
        list.id = 'search-results-window-list';
        list.style.cssText = 'overflow-y:auto;padding:6px;flex:1 1 auto;';

        win.appendChild(header);
        win.appendChild(list);
        document.body.appendChild(win);

        makeWindowDraggable(win, header);
        searchResultsWindow = win;
        return win;
    }

    // Drag lewat header. Memakai pointer events supaya jalan di mouse & touch,
    // dan menjaga window tetap di dalam viewport.
    function makeWindowDraggable(win, handle) {
        let dragging = false;
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;

        handle.addEventListener('pointerdown', function (e) {
            if (e.target.closest('button')) return; // jangan drag saat klik ×
            dragging = true;
            const rect = win.getBoundingClientRect();
            // Setelah drag pertama, posisikan via left/top (buang right).
            win.style.left = rect.left + 'px';
            win.style.top = rect.top + 'px';
            win.style.right = 'auto';
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        handle.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const maxLeft = window.innerWidth - win.offsetWidth;
            const maxTop = window.innerHeight - handle.offsetHeight;
            const nextLeft = Math.min(Math.max(0, startLeft + dx), Math.max(0, maxLeft));
            const nextTop = Math.min(Math.max(0, startTop + dy), Math.max(0, maxTop));
            win.style.left = nextLeft + 'px';
            win.style.top = nextTop + 'px';
        });

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);
    }

    // Label tipe node ("VISI"/"RISIKO"/"OPD Penanggung Jawab" dst) untuk badge.
    function nodeTypeLabel(node) {
        if (!node) return '';
        if (node.name === 'OPD') return 'OPD Penanggung Jawab';
        return node.name || '';
    }

    // Cuplikan isi node untuk baris hasil (node.value bisa panjang).
    function nodeSnippet(node) {
        const raw = node && node.value != null ? String(node.value) : '';
        const flat = raw.replace(/\s+/g, ' ').trim();
        return flat.length > 90 ? flat.slice(0, 90) + '…' : flat;
    }

    function renderSearchResultsWindow() {
        // Tanpa hasil → sembunyikan & reset flag "ditutup manual" agar
        // pencarian berikutnya bisa memunculkannya lagi.
        if (!searchQuery || searchMatches.length === 0) {
            if (searchResultsWindow) searchResultsWindow.style.display = 'none';
            searchWindowManuallyClosed = false;
            return;
        }

        const win = buildSearchResultsWindow();

        // Warna dark bisa berubah setelah window dibuat (user toggle tema di
        // aplikasi induk) — selaraskan ulang tiap render, bukan hanya saat build.
        if (document.documentElement.classList.contains('dark')) {
            win.style.setProperty('--sr-bg', '#1f2937');
            win.style.setProperty('--sr-fg', '#e5e7eb');
        } else {
            win.style.setProperty('--sr-bg', '#ffffff');
            win.style.setProperty('--sr-fg', '#1f2937');
        }

        const title = document.getElementById('search-results-window-title');
        if (title) {
            title.textContent = `Hasil Pencarian (${searchMatches.length})`;
            title.title = `${searchMatches.length} hasil untuk "${searchQuery}"`;
        }

        const list = document.getElementById('search-results-window-list');
        list.innerHTML = '';

        searchMatches.forEach((nodeId, idx) => {
            const node = chartData.nodes.find(n => n.id === nodeId);
            if (!node) return;

            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.index = String(idx);
            const isActive = idx === searchCurrentIndex;
            item.style.cssText = [
                'padding:8px 10px', 'margin-bottom:4px', 'border-radius:8px',
                'cursor:pointer', 'border:1px solid transparent',
                'transition:background 0.15s',
                isActive
                    ? 'background:color-mix(in srgb, var(--primary,#0ea5e9) 22%, transparent);border-color:var(--primary,#0ea5e9);'
                    : 'background:color-mix(in srgb, currentColor 6%, transparent);',
            ].join(';');

            const typeLabel = nodeTypeLabel(node);
            const snippet = nodeSnippet(node);
            item.innerHTML =
                `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                    <span style="flex:0 0 auto;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;padding:1px 6px;border-radius:999px;background:var(--primary,#0ea5e9);color:#fff;">${escapeHtml(typeLabel)}</span>
                    <span style="flex:0 0 auto;opacity:0.6;font-size:11px;">#${idx + 1}</span>
                 </div>
                 <div style="line-height:1.35;">${highlightMatchInHtml(snippet || typeLabel, searchQuery)}</div>`;

            item.addEventListener('click', function () {
                // Klik = lompat + sorot + buka detail (goToSearchMatch sudah
                // memanggil showNodeDetail). Window tetap terbuka.
                goToSearchMatch(idx);
            });
            item.addEventListener('mouseenter', function () {
                if (idx !== searchCurrentIndex) item.style.background = 'color-mix(in srgb, var(--primary,#0ea5e9) 12%, transparent)';
            });
            item.addEventListener('mouseleave', function () {
                if (idx !== searchCurrentIndex) item.style.background = 'color-mix(in srgb, currentColor 6%, transparent)';
            });

            list.appendChild(item);
        });

        // Hormati keputusan user menutup window: jangan paksa buka lagi
        // untuk query yang sama sampai pencarian dibersihkan / berganti.
        if (!searchWindowManuallyClosed) {
            win.style.display = 'flex';
        }

        // Pastikan item aktif terlihat di dalam daftar.
        const activeEl = list.querySelector(`.search-result-item[data-index="${searchCurrentIndex}"]`);
        if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }

    window.runHierarchySearch = runHierarchySearch;
    window.hierarchySearchOrNext = searchOrNext;
    window.hierarchySearchNext = searchNext;
    window.hierarchySearchPrev = searchPrev;
    window.clearHierarchySearch = clearHierarchySearch;

    // Cetak seluruh diagram dalam satu halaman, di-scale agar pas
    // (fit-to-page). Memakai CSS "zoom" (bukan transform: scale) karena
    // zoom benar-benar mengecilkan ukuran layout — sehingga perhitungan
    // page-break milik browser cetak ikut menyusut dan seluruh diagram
    // tetap berada dalam satu halaman fisik. transform hanya mengubah
    // tampilan visual tanpa memengaruhi ukuran layout, sehingga browser
    // tetap menghitung ukuran asli (jauh lebih besar dari kertas) dan
    // memecahnya ke banyak halaman.
    function printHierarchy() {
        const chartArea = document.getElementById('chart-area');
        const wrapper = document.getElementById('chart-scale-wrapper');
        const treeContainer = document.getElementById('tree-container');
        if (!chartArea || !wrapper || !treeContainer) {
            window.print();
            return;
        }

        const cleanup = () => {
            document.documentElement.classList.remove('printing-hierarchy');
            document.documentElement.style.removeProperty('--print-scale');
            window.removeEventListener('afterprint', cleanup);
            // Kembalikan transform zoom UI biasa lewat applyZoom() (bukan
            // set transform manual) — applyZoom() juga memperbarui ukuran
            // #chart-scale-wrapper berdasarkan ukuran chartArea saat ini
            // (yang sudah kembali normal karena class "printing-hierarchy"
            // di atas sudah dilepas). Tanpa ini, wrapper tetap memakai
            // ukuran compact dari mode cetak sehingga area scroll tidak
            // sinkron dengan ukuran konten sesungguhnya dan tampilan
            // terlihat berantakan/tidak sejajar.
            applyZoom();
            const svgEl = document.getElementById('connectors');
            if (svgEl && chartArea) {
                svgEl.style.width = chartArea.offsetWidth + 'px';
                svgEl.style.height = chartArea.offsetHeight + 'px';
            }
            drawConnectors();
        };

        // Pasang class compact TERLEBIH DAHULU (memadatkan gap/padding
        // khusus cetak) dan lepas transform zoom UI biasa SEPANJANG
        // seluruh proses cetak (dikembalikan lewat applyZoom() di
        // cleanup() di atas, BUKAN dengan menyimpan/mengembalikan nilai
        // transform lama secara manual) — sebelumnya transform
        // dikembalikan manual sesaat setelah mengukur, sehingga saat
        // print benar-benar dipanggil, chartArea kembali punya
        // transform: scale(zoom) AKTIF bertumpuk dengan CSS
        // zoom: var(--print-scale) dari class compact, menghasilkan
        // skala ganda dan garis konektor yang melenceng jauh dari
        // posisi node sesungguhnya.
        document.documentElement.classList.add('printing-hierarchy');
        chartArea.style.transform = 'none';

        // Baris berikutnya memaksa reflow supaya scrollWidth/Height di
        // bawah membaca layout compact yang baru saja diterapkan.
        void chartArea.offsetHeight;

        const naturalWidth = chartArea.scrollWidth;
        const naturalHeight = chartArea.scrollHeight;

        // Area kertas A4 landscape pada 96dpi dikurangi margin cetak.
        const PAGE_WIDTH_PX = 1122;  // ~297mm
        const PAGE_HEIGHT_PX = 793;  // ~210mm
        const MARGIN_PX = 24;
        const availableWidth = PAGE_WIDTH_PX - MARGIN_PX * 2;
        const availableHeight = PAGE_HEIGHT_PX - MARGIN_PX * 2;

        const printScale = Math.min(
            availableWidth / naturalWidth,
            availableHeight / naturalHeight,
            1
        );

        document.documentElement.style.setProperty('--print-scale', printScale);

        // SVG #connectors diset ke ukuran SUDAH TERSKALA (bukan ukuran
        // natural mentah) karena drawConnectorsScaled() di bawah menulis
        // koordinat garis yang juga sudah dikalikan printScale — SVG
        // viewport dan koordinat isinya harus memakai satuan yang sama.
        const svg = document.getElementById('connectors');
        if (svg) {
            svg.style.width = (naturalWidth * printScale) + 'px';
            svg.style.height = (naturalHeight * printScale) + 'px';
        }

        window.addEventListener('afterprint', cleanup);

        // Koordinat garis dihitung manual dari posisi UNSCALED × printScale
        // (lihat drawConnectorsScaled), bukan dari getBoundingClientRect()
        // setelah CSS zoom diterapkan — sehingga tidak bergantung pada
        // apakah/kapan browser sudah me-reflow "zoom" secara visual, atau
        // pada bagaimana mesin render cetak PDF memprosesnya. Satu frame
        // masih diberi agar layout compact (gap/padding) di atas stabil
        // sebelum diukur.
        window.requestAnimationFrame(() => {
            void chartArea.offsetHeight;
            drawConnectorsScaled(printScale);

            // Beri satu frame lagi untuk memastikan garis yang baru saja
            // digambar sudah stabil sebelum print dialog membuka snapshot.
            window.requestAnimationFrame(() => {
                window.print();
                // Fallback untuk browser yang tidak memicu 'afterprint'
                // (mis. beberapa versi print-to-PDF headless).
                setTimeout(cleanup, 2000);
            });
        });
    }
    window.printHierarchy = printHierarchy;

    // Handle window resize
    let resizeTimeout;
    // Ukuran chart mengikuti kontennya (width: max-content), tidak
    // terpengaruh ukuran viewport — cukup terapkan ulang zoom.
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.requestAnimationFrame(applyZoom);
        }, 500); // Increased debounce to 500ms
    });

    // Handler for mode change (optional, for external call)
    window.onModeChange = function(mode) {
        // Remove highlight if mode changes
        resetHighlight();
    };

    // Notes: search state (searchMatches/searchQuery) is intentionally NOT
    // reset by resetHighlight()/onModeChange() — Mode Sorotan (ancestors/
    // descendants/total) and the search highlight are independent overlays
    // using separate CSS classes ('highlighted'/'highlighted-path' vs
    // 'search-match'/'search-current'), so switching mode should not wipe
    // an active search.

    // Export public API
    window.initializeHierarchy = function(data) {
        chartData = data;
        createChart();
    };

    window.resetHierarchyHighlight = resetHighlight;

})(window);
