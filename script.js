// 1. Supplier Registry & Material Database
const REGISTRY = {
    suppliers: [
        { id: "s1", name: "Global Pharma Chem (Germany)", rating: "Grade A" },
        { id: "s2", name: "Asia-API Limited (Singapore)", rating: "Grade B" },
        { id: "s3", name: "AmeriIngredients (USA)", rating: "Grade A" }
    ],
    materials: {
        fillers: [
            { id: "f1", en: "Lactose Monohydrate", ar: "لاكتوز أحادي المادة", cost: 0.00008 },
            { id: "f2", en: "MCC PH102", ar: "سيليلوز دقيق التبلور", cost: 0.00012 }
        ],
        binders: [
            { id: "b1", en: "PVP K30", ar: "بوفيدون K30", cost: 0.00045 },
            { id: "b2", en: "HPMC E5", ar: "هيدروكسي بروبيل", cost: 0.00035 }
        ]
    }
};

// 2. Bilingual Dictionary
const UI = {
    en: {
        title: "PharmaFormulator Pro", sub: "Global Manufacturing & Logistics System",
        btn: "Generate Certified Report", api: "API Name & Unit Dose (mg)", batch: "Batch Quantity (Total Units)",
        th_m: "Material", th_r: "Role", th_s: "Approved Supplier", th_q: "Qty/Unit", th_c: "Cost %",
        log_p: "Total Euro-Pallets", log_a: "Warehouse Footprint", log_c: "Total Batch Valuation",
        hash: "Digital Signature:", foot: "© 2026 IP Reserved - International Trade Secret",
        rep_t: "Certified Manufacturing Report", active: "Active Ingredient", filler: "Filler", binder: "Binder"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية العالمي",
        btn: "توليد التقرير المعتمد", api: "اسم المادة الفعالة والجرعة (ملجم)", batch: "حجم التشغيلة (وحدة)",
        th_m: "المادة", th_r: "الدور", th_s: "المورد المعتمد", th_q: "الكمية", th_c: "التكلفة %",
        log_p: "إجمالي منصات الشحن", log_a: "مساحة التخزين", log_c: "القيمة الكلية للتشغيلة",
        hash: "التوقيع الرقمي:", foot: "© 2026 جميع الحقوق محفوظة - حماية الأسرار التجارية",
        rep_t: "تقرير التصنيع المعتمد", active: "المادة الفعالة", filler: "مادة مالئة", binder: "مادة رابطة"
    }
};

let costChart = null;

window.onload = () => {
    populateSuppliers();
    updateUI(); // Default to English on load
};

function populateSuppliers() {
    document.getElementById('supplier-select').innerHTML = REGISTRY.suppliers.map(s => 
        `<option value="${s.id}">${s.name} (${s.rating})</option>`).join('');
}

function updateUI() {
    const lang = document.getElementById('lang').value;
    const t = UI[lang];
    document.getElementById('app-container').dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.sub;
    document.getElementById('btn-run').innerText = t.btn;
    document.getElementById('lbl-api').innerText = t.api;
    document.getElementById('lbl-batch').innerText = t.batch;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-s').innerText = t.th_s;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('th-c').innerText = t.th_c;
    document.getElementById('footer-text').innerText = t.foot;
    document.getElementById('h-report-title').innerText = t.rep_t;
}

function toggleManualSelect() {
    const mode = document.getElementById('cost-mode').value;
    document.getElementById('manual-area').style.display = mode === 'manual' ? 'block' : 'none';
}

function runFormulator() {
    const lang = document.getElementById('lang').value;
    const units = parseInt(document.getElementById('batch-units').value) || 0;
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const apiName = document.getElementById('api-name').value || "LOT-PRO-001";
    
    // Logic for AI Optimization vs Manual Selection
    let selectedFiller, selectedBinder, supplier;
    
    if(document.getElementById('cost-mode').value === 'auto') {
        selectedFiller = REGISTRY.materials.fillers.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        selectedBinder = REGISTRY.materials.binders.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        supplier = REGISTRY.suppliers[0].name; // Auto-select Grade A
    } else {
        selectedFiller = REGISTRY.materials.fillers[0];
        selectedBinder = REGISTRY.materials.binders[1];
        supplier = REGISTRY.suppliers.find(s => s.id === document.getElementById('supplier-select').value).name;
    }

    const formula = [
        { name: apiName, role: UI[lang].active, supplier: supplier, qty: dose, cost: 0.009 },
        { name: lang === 'en' ? selectedFiller.en : selectedFiller.ar, role: UI[lang].filler, supplier: "Internal Stock", qty: dose * 0.4, cost: selectedFiller.cost },
        { name: lang === 'en' ? selectedBinder.en : selectedBinder.ar, role: UI[lang].binder, supplier: supplier, qty: dose * 0.08, cost: selectedBinder.cost }
    ];

    renderReport(formula, units, lang);
}

function renderReport(formula, units, lang) {
    const totalUnitCost = formula.reduce((sum, item) => sum + (item.qty * item.cost), 0);
    
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td>${i.role}</td>
            <td>${i.supplier}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${(((i.qty * i.cost) / totalUnitCost) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // Update Audit Trail
    const now = new Date();
    document.getElementById('audit-trail').innerHTML = `Logistics/Formulation Verification: ${now.toUTCString()} | System Node: #ENT-552`;

    // Calculations for Logistics
    const pallets = Math.ceil(units / 4500); 
    const area = (pallets * 1.5).toFixed(1); // 1.5m2 per pallet with buffer
    const valuation = (totalUnitCost * units).toLocaleString();

    document.getElementById('logistics-data').innerHTML = `
        <div class="info-box"><h3>${pallets}</h3><p>${UI[lang].log_p}</p></div>
        <div class="info-box"><h3>${area} $m^2$</h3><p>${UI[lang].log_a}</p></div>
        <div class="info-box"><h3>$${valuation}</h3><p>${UI[lang].log_c}</p></div>
    `;

    // Security Branding
    const hash = "SEC-GxP-" + btoa(Date.now().toString()).substring(4, 13).toUpperCase();
    document.getElementById('digital-sig').innerText = hash;
    JsBarcode("#barcode", hash, { height: 35, displayValue: false });

    // Charting
    updateChart(formula, lang);
    document.getElementById('results-area').style.display = "block";
}

function updateChart(formula, lang) {
    if(costChart) costChart.destroy();
    const ctx = document.getElementById('costChart').getContext('2d');
    costChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{
                data: formula.map(i => i.qty * i.cost),
                backgroundColor: ['#1a3a5a', '#2ecc71', '#f1c40f']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}
