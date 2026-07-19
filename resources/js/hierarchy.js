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
        "#a2d2ff"  // Level 6 - Risiko
    ];

    // Palet untuk level atribut risiko (7+) yang jumlahnya dinamis
    // mengikuti kolom tabel — diulang bila kolom lebih banyak
    // daripada jumlah warna.
    const attrColors = [
        "#ffd6e0", "#ffe5b4", "#fdffb6", "#caffbf", "#9bf6ff",
        "#a0c4ff", "#bdb2ff", "#ffc6ff", "#e2ece9", "#ffadad",
        "#ffd6a5", "#fbf8cc", "#b9fbc0", "#98f5e1", "#8eecf5",
        "#90dbf4", "#a3c4f3", "#cfbaf0", "#f1c0e8", "#ffcfd2"
    ];

    let chartData = null;
    let zoomLevel = 1;
    let selectedNodeId = null;
    let selectedHighlightMode = 'total';

    function escapeSelector(value) {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
            return CSS.escape(value);
        }
        return String(value).replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    }

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

        // Update SVG size after all nodes are created
        const svg = document.getElementById('connectors');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;');

        // Use requestAnimationFrame to ensure nodes are rendered before calculating connector positions
        window.requestAnimationFrame(() => {
            const chartRect = chartArea.getBoundingClientRect();
            const contentWidth = Math.max(chartArea.scrollWidth, chartRect.width, 1000);
            const contentHeight = Math.max(chartArea.scrollHeight, chartRect.height, 600);

            svg.setAttribute('width', contentWidth);
            svg.setAttribute('height', contentHeight);
            svg.setAttribute('viewBox', `0 0 ${contentWidth} ${contentHeight}`);
            svg.setAttribute('preserveAspectRatio', 'none');

            // Draw connectors after size is set
            drawConnectors();

            // Reapply selected node highlight after redraw
            if (selectedNodeId) {
                const selectedNode = chartArea.querySelector(`.node[data-id="${escapeSelector(selectedNodeId)}"]`);
                if (selectedNode) {
                    selectedNode.classList.add('highlighted');
                }
            }

            // Terapkan zoom terakhir setelah semua pengukuran 1:1 selesai.
            applyZoom();
        });

        // Add scroll listener to redraw connectors when scrolling
        let scrollTimeout;
        treeContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                drawConnectors();
            }, 100);
        });
    }

    function createNodeDiv(node, level, container) {
        // Only create once per node id
        if (document.querySelector(`.node[data-id="${escapeSelector(node.id)}"]`)) return;
        const div = document.createElement('div');
        div.className = 'node';
        div.dataset.id = node.id;
        div.dataset.level = level;

        // Level 7+ adalah atribut risiko yang jumlahnya dinamis mengikuti
        // kolom tabel — palet atribut diulang bila kolom lebih banyak
        // daripada jumlah warna.
        let headerColor = level < 7
            ? (levelColors[level] || '#ddd')
            : attrColors[(level - 7) % attrColors.length];
        let label = node.name;
        if (level == 5 || node.name === 'OPD') {
            headerColor = levelColors[5];
            label = 'OPD Penanggung Jawab';
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

        div.innerHTML = `
            <div class=\"node-header\" style=\"background-color: ${headerColor}\">${label}</div>
            <div class=\"node-value\">${node.value}</div>
        `;
        div.querySelector('.node-header').appendChild(infoBtn);

        div.addEventListener('click', () => highlightNode(node.id));
        container.appendChild(div);
    }

    // Modal untuk info node
    function showNodeDetail(node) {
        let html = `<h4>Detail ${node.name}</h4><ul style="list-style:none;padding:0;">`;
        for (const key in node) {
            if (['id','name','children','level'].includes(key)) continue;
            if (node[key] && typeof node[key] !== 'object') {
                html += `<li><b>${key.replace(/_/g,' ').toUpperCase()}</b>: ${node[key]}</li>`;
            }
        }
        html += '</ul>';
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
            modal.innerHTML = `<div style="background:#fff;padding:24px 32px;border-radius:10px;min-width:320px;max-width:90vw;max-height:80vh;overflow:auto;position:relative;">
                <button id="close-node-detail-modal" style="position:absolute;top:8px;right:8px;font-size:18px;">&times;</button>
                <div id="node-detail-content"></div>
            </div>`;
            document.body.appendChild(modal);
            modal.querySelector('#close-node-detail-modal').onclick = function() {
                modal.style.display = 'none';
            };
        }
        modal.style.display = 'flex';
        modal.querySelector('#node-detail-content').innerHTML = html;
    }

    function drawConnectors() {
        const svg = document.getElementById('connectors');
        const treeContainer = document.getElementById('tree-container');
        if (!svg || !chartData || !treeContainer) return;
        svg.innerHTML = '';

        const chartArea = document.querySelector('.chart-area');
        if (!chartArea) return;

        const chartAreaRect = chartArea.getBoundingClientRect();

        // Draw all edges
        chartData.edges.forEach(edge => {
            const parentEl = chartArea.querySelector(`.node[data-id="${escapeSelector(edge.from)}"]`);
            const childEl = chartArea.querySelector(`.node[data-id="${escapeSelector(edge.to)}"]`);
            if (!parentEl || !childEl) return;

            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();

            // Calculate positions relative to chartArea.
            // Rect dari getBoundingClientRect ikut terskala transform,
            // sedangkan SVG digambar dalam koordinat layout 1:1 —
            // bagi dengan zoomLevel agar konektor tetap tepat saat zoom.
            const x1 = (parentRect.left - chartAreaRect.left + parentRect.width / 2) / zoomLevel;
            const y1 = (parentRect.bottom - chartAreaRect.top) / zoomLevel;
            const x2 = (childRect.left - chartAreaRect.left + childRect.width / 2) / zoomLevel;
            const y2 = (childRect.top - chartAreaRect.top) / zoomLevel;
            const yMid = y1 + Math.max(20, (y2 - y1) / 2);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${x1} ${y1} V ${yMid} H ${x2} V ${y2}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'connector');
            path.setAttribute('data-parent', edge.from);
            path.setAttribute('data-child', edge.to);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#e53935');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(path);
        });

        if (selectedNodeId) {
            const selectedNode = document.querySelector(`.node[data-id="${escapeSelector(selectedNodeId)}"]`);
            if (selectedNode) {
                selectedNode.classList.add('highlighted');
            }
            applyHighlightPath();
        }
    }

    // Versi cetak: koordinat dihitung dari posisi natural (dibagi
    // zoomLevel layar seperti drawConnectors() biasa) dikalikan manual
    // dengan `scale`, BUKAN dari getBoundingClientRect() setelah CSS
    // zoom cetak diterapkan. CSS "zoom" bukan properti standar dan cara
    // mesin render cetak (yang menghasilkan file PDF) memprosesnya bisa
    // sedikit berbeda dari cara browser me-reflow tampilan layar biasa —
    // menghitung manual dari matematika (posisi asli × skala) menghindari
    // ketidaksesuaian itu sepenuhnya.
    function drawConnectorsScaled(scale) {
        const svg = document.getElementById('connectors');
        const chartArea = document.querySelector('.chart-area');
        if (!svg || !chartData || !chartArea) return;
        svg.innerHTML = '';

        const prevTransform = chartArea.style.transform;
        const prevZoom = chartArea.style.zoom;
        chartArea.style.transform = 'none';
        chartArea.style.zoom = '1';
        void chartArea.offsetHeight; // paksa reflow sebelum mengukur
        const chartAreaRect = chartArea.getBoundingClientRect();

        chartData.edges.forEach(edge => {
            const parentEl = chartArea.querySelector(`.node[data-id="${escapeSelector(edge.from)}"]`);
            const childEl = chartArea.querySelector(`.node[data-id="${escapeSelector(edge.to)}"]`);
            if (!parentEl || !childEl) return;

            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();
            // Lewati node yang belum benar-benar ter-render/ter-layout
            // (rect kosong) — menggambar garis dari koordinat 0,0 akan
            // menghasilkan garis "liar" yang melenceng jauh dari diagram.
            if (parentRect.width === 0 || childRect.width === 0) return;

            const x1 = (parentRect.left - chartAreaRect.left + parentRect.width / 2) * scale;
            const y1 = (parentRect.bottom - chartAreaRect.top) * scale;
            const x2 = (childRect.left - chartAreaRect.left + childRect.width / 2) * scale;
            const y2 = (childRect.top - chartAreaRect.top) * scale;
            const yMid = y1 + Math.max(20, (y2 - y1) / 2);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${x1} ${y1} V ${yMid} H ${x2} V ${y2}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'connector');
            path.setAttribute('data-parent', edge.from);
            path.setAttribute('data-child', edge.to);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#e53935');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(path);
        });

        chartArea.style.transform = prevTransform;
        chartArea.style.zoom = prevZoom;
    }

    function highlightNode(nodeId) {
        selectedNodeId = nodeId;
        if (!selectedHighlightMode) {
            selectedHighlightMode = 'total';
        }
        resetHighlight();
        const clickedNode = document.querySelector(`.node[data-id="${escapeSelector(nodeId)}"]`);
        if (clickedNode) {
            clickedNode.classList.add('highlighted');
            applyHighlightPath();
        }
    }

    // Kunci baris asal dari sebuah edge. Backend mengirim 'rows' sebagai
    // objek map (mis. {"0": true, "5": true}) karena di-JSON-encode dari
    // associative array PHP — di sini dinormalisasi jadi Set of number.
    function edgeRowSet(edge) {
        if (!edge.rows) return new Set();
        return new Set(Object.keys(edge.rows).map(Number));
    }

    function intersectRows(setA, setB) {
        const result = new Set();
        setA.forEach(v => { if (setB.has(v)) result.add(v); });
        return result;
    }

    // Guard anti-loop dikunci per (node, baris) — bukan per node saja.
    // Node gabungan bisa dikunjungi lewat lebih dari satu konteks baris
    // (mis. RISIKO yang sama persis muncul di 2 baris tabel berbeda);
    // masing-masing baris tetap berhak ditelusuri sampai ujungnya sendiri.
    function visitKey(nodeId, rows) {
        return nodeId + '::' + Array.from(rows).sort((a, b) => a - b).join(',');
    }

    function initialContextRows(nodeId) {
        const contextRows = new Set();
        chartData.edges.forEach(edge => {
            if (edge.from === nodeId || edge.to === nodeId) {
                edgeRowSet(edge).forEach(r => contextRows.add(r));
            }
        });
        return contextRows;
    }

    function applyHighlightPath() {
        if (!selectedNodeId) return;
        // Baris konteks awal = gabungan semua baris dari edge manapun yang
        // menyentuh node yang dipilih (sebagai parent atau child). Node
        // yang digabung (dedup by value) bisa menjadi milik banyak baris
        // tabel sekaligus — traversal berikutnya mempersempit konteks ini
        // seiring naik/turun, sehingga jalur yang ditelusuri tetap
        // konsisten dengan baris data asli, bukan menyebar ke rantai lain
        // yang kebetulan bertemu di sini.
        const contextRows = initialContextRows(selectedNodeId);
        if (selectedHighlightMode === 'ancestors' || selectedHighlightMode === 'total') {
            highlightAncestors(selectedNodeId, contextRows);
        }
        if (selectedHighlightMode === 'descendants' || selectedHighlightMode === 'total') {
            highlightDescendants(selectedNodeId, contextRows);
        }
    }

    function highlightAncestors(nodeId, contextRows, visited = new Set()) {
        const key = visitKey(nodeId, contextRows);
        if (visited.has(key)) return;
        visited.add(key);
        const chartArea = document.querySelector('.chart-area');
        if (!chartArea) return;
        // Find all edges where to = nodeId AND yang berbagi baris asal
        // dengan konteks yang sedang ditelusuri.
        chartData.edges.forEach(edge => {
            if (edge.to !== nodeId) return;
            const sharedRows = intersectRows(edgeRowSet(edge), contextRows);
            if (sharedRows.size === 0) return;

            const parentId = edge.from;
            const parentNode = chartArea.querySelector(`.node[data-id="${escapeSelector(parentId)}"]`);
            const connector = chartArea.querySelector(`.connector[data-parent="${escapeSelector(parentId)}"][data-child="${escapeSelector(nodeId)}"]`);
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
        const chartArea = document.querySelector('.chart-area');
        if (!chartArea) return;
        // Find all edges where from = nodeId AND yang berbagi baris asal
        // dengan konteks yang sedang ditelusuri.
        chartData.edges.forEach(edge => {
            if (edge.from !== nodeId) return;
            const sharedRows = intersectRows(edgeRowSet(edge), contextRows);
            if (sharedRows.size === 0) return;

            const childId = edge.to;
            const childEl = chartArea.querySelector(`.node[data-id="${escapeSelector(childId)}"]`);
            const connector = chartArea.querySelector(`.connector[data-parent="${escapeSelector(nodeId)}"][data-child="${escapeSelector(childId)}"]`);
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

    // Cetak seluruh diagram dalam satu halaman, di-scale agar pas
    // (fit-to-page). Memakai CSS "zoom" (bukan transform: scale) karena
    // zoom benar-benar mengecilkan ukuran layout — sehingga perhitungan
    // page-break milik browser cetak ikut menyusut dan seluruh diagram
    // tetap berada dalam satu halaman fisik. transform hanya mengubah
    // tampilan visual tanpa memengaruhi ukuran layout, sehingga browser
    // tetap menghitung ukuran asli (jauh lebih besar dari kertas) dan
    // memecahnya ke banyak halaman.
    function printHierarchy() {
        const chartArea = document.querySelector('.chart-area');
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
            const chartRect = chartArea.getBoundingClientRect();
            const contentWidth = Math.max(chartArea.scrollWidth, chartRect.width, 1000);
            const contentHeight = Math.max(chartArea.scrollHeight, chartRect.height, 600);
            const svgEl = document.getElementById('connectors');
            if (svgEl) {
                svgEl.setAttribute('width', contentWidth);
                svgEl.setAttribute('height', contentHeight);
                svgEl.setAttribute('viewBox', `0 0 ${contentWidth} ${contentHeight}`);
            }
            drawConnectors();
        };

        // Pasang class compact TERLEBIH DAHULU (memadatkan gap/padding
        // khusus cetak) dan lepas transform zoom UI biasa SEPANJANG
        // seluruh proses cetak (dikembalikan lewat applyZoom() di
        // cleanup() di atas) — sebelumnya transform dikembalikan manual
        // sesaat setelah mengukur, sehingga saat print benar-benar
        // dipanggil, chartArea kembali punya transform: scale(zoomLevel)
        // AKTIF bertumpuk dengan CSS zoom: var(--print-scale) dari class
        // compact, menghasilkan skala ganda dan garis konektor yang
        // melenceng jauh dari posisi node sesungguhnya.
        document.documentElement.classList.add('printing-hierarchy');
        chartArea.style.transform = 'none';
        void chartArea.offsetHeight; // paksa reflow sebelum mengukur

        const naturalWidth = chartArea.scrollWidth;
        const naturalHeight = chartArea.scrollHeight;

        const PAGE_WIDTH_PX = 1122;  // A4 landscape ~297mm @ 96dpi
        const PAGE_HEIGHT_PX = 793;  // ~210mm @ 96dpi
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
        // koordinat garis yang juga sudah dikalikan printScale.
        const printSvg = document.getElementById('connectors');
        if (printSvg) {
            const scaledWidth = naturalWidth * printScale;
            const scaledHeight = naturalHeight * printScale;
            printSvg.setAttribute('width', scaledWidth);
            printSvg.setAttribute('height', scaledHeight);
            printSvg.setAttribute('viewBox', `0 0 ${scaledWidth} ${scaledHeight}`);
        }

        window.addEventListener('afterprint', cleanup);

        // Koordinat garis dihitung manual dari posisi UNSCALED × printScale
        // (lihat drawConnectorsScaled), bukan dari getBoundingClientRect()
        // setelah CSS zoom diterapkan — sehingga tidak bergantung pada
        // apakah/kapan browser sudah me-reflow "zoom" secara visual, atau
        // pada bagaimana mesin render cetak PDF memprosesnya.
        window.requestAnimationFrame(() => {
            void chartArea.offsetHeight;
            drawConnectorsScaled(printScale);

            window.requestAnimationFrame(() => {
                window.print();
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
        selectedHighlightMode = mode || 'total';
        if (selectedNodeId) {
            resetHighlight();
            const clickedNode = document.querySelector(`.node[data-id="${escapeSelector(selectedNodeId)}"]`);
            if (clickedNode) {
                clickedNode.classList.add('highlighted');
                applyHighlightPath();
            }
        }
    };

    // Export public API
    window.initializeHierarchy = function(data) {
        chartData = data;
        createChart();
    };

    window.resetHierarchyHighlight = function() {
        selectedNodeId = null;
        resetHighlight();
    };

})(window);
