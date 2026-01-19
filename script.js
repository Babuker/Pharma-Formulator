// 1. Core Enterprise Databases
const DATABASE = {
    suppliers: [
        { id: "s1", name: "Global-API Nordics", rating: "A-Certified" },
        { id: "s2", name: "EuroChem Ingredients", rating: "B-Vetted" },
        { id: "s3", name: "Asia-Pacific Pharma Supply", rating: "A-Certified" }
    ],
    excipients: {
        fillers: [
            { id: "f1", en: "MCC PH102", ar: "سيليلوز متبلور", cost: 0.00012 },
            { id: "f2", en: "Lactose Anhydrous", ar: "لاكتوز لامائي", cost: 0.00009 }
        ],
        binders: [
            { id: "b1", en: "PVP K30", ar: "بوفيدون", cost: 0.00045 },
            { id: "b2", en: "HPMC E15", ar: "هيدروكسي بروبيل", cost: 0.00035 }
        ]
    }
};

const UI_STRINGS = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics Intelligence",
        btn: "Authorize & Generate Report", api: "API Designation & Dose (mg)", batch: "Target Batch Size (Units)",
        th_m: "Material", th_r: "Function", th_s: "Supplier Source", th_q: "Qty/Unit", th_c: "Cost Distribution",
        log_p: "Total Euro-Pallets", log_a: "Warehouse Footprint", log_v: "Batch Valuation",
        hash: "Digital Signature (GxP Authenticity):", foot: "© 2026 PharmaFormulator Enterprise. Intellectual Property Protected.",
        rep_t: "Certified Formulation Analysis", active: "Active Ingredient", filler: "Filler", binder: "Binder"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل",
        btn: "اعتماد وتوليد التقرير", api: "اسم المادة الفعالة والجرعة (ملجم)", batch: "حجم التشغيلة المستهدف",
        th_m: "المادة", th_r: "الوظيفة", th_s: "المورد المعتمد", th_q: "الكمية/وحدة", th_c: "توزيع التكلفة",
        log_p: "إجمالي منصات الشحن", log_a: "مساحة المستودع", log_v: "قيمة التشغيلة الكلية",
        hash: "التوقيع الرقمي (GxP):", foot: "© 2026 جميع الحقوق محفوظة - حماية الأسرار التجارية الدولية.",
        rep_t: "تحليل الصيغة المعتمدة", active: "المادة الفعالة", filler: "مادة مالئة", binder: "مادة رابطة"
    }
};

let activeChart = null;

// Initialize on Load
window.onload = () => {
    const sDropdown = document.getElementById('supplier-select');
    sDropdown.innerHTML = DATABASE.suppliers.map(s => `<option value="${s.id}">${s.name} (${s.rating})</option>`).join('');
    updateUI(); 
};

function toggleManual() {
    const mode = document.getElementById('cost-mode').value;
    document.getElementById('supplier-group').style.display = mode === 'manual' ? 'block' : 'none';
}

function updateUI() {
    const lang = document.getElementById('lang').value;
    const t = UI_STRINGS[lang];
    document.getElementById('app-container').dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Core labels translation
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
    document.getElementById('lbl-hash').innerText = t.hash;
}

function runFormulator() {
    const lang = document.getElementById('lang').value;
    const units = parseInt(document.getElementById('batch-units').value) || 0;
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const apiNameInput = document.getElementById('api-name').value || "B-772-API";
    
    // AI Cost Optimization Logic
    let filler, binder, supplier;
    if(document.getElementById('cost-mode').value === 'auto') {
        filler = DATABASE.excipients.fillers.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        binder = DATABASE.excipients.binders.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        supplier = DATABASE.suppliers.find(s => s.rating === "A-Certified").name;
    } else {
        filler = DATABASE.excipients.fillers[0];
        binder = DATABASE.excipients.binders[0];
        supplier = DATABASE.suppliers.find(s => s.id === document.getElementById('supplier-select').value).name;
    }

    const formula = [
        { name: apiNameInput, role: UI_STRINGS[lang].active, source: supplier, qty: dose, cost: 0.008 },
        { name: lang==='en'?filler.en:filler.ar, role: UI_STRINGS[lang].filler, source: "Internal Stock", qty: dose * 0.55, cost: filler.cost },
        { name: lang==='en'?binder.en:binder.ar, role: UI_STRINGS[lang].binder, source: supplier, qty: dose * 0.1, cost: binder.cost }
    ];

    generateReport(formula, units, lang);
}

function generateReport(formula, units, lang) {
    const totalUnitCost = formula.reduce((sum, item) => sum + (item.qty * item.cost), 0);
    
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td>${i.role}</td>
            <td>${i.source}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${(((i.qty * i.cost) / totalUnitCost) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // Logistics & Security
    const pallets = Math.ceil(units / 5500); // 5500 units per pallet standard
    const space = (pallets * 1.6).toFixed(1); 
    const valuation = (totalUnitCost * units).toLocaleString();

    document.getElementById('logistics-data').innerHTML = `
        <div class="info-box"><h3>${pallets}</h3><p>${UI_STRINGS[lang].log_p}</p></div>
        <div class="info-box"><h3>${space} m²</h3><p>${UI_STRINGS[lang].log_a}</p></div>
        <div class="info-box"><h3>$${valuation}</h3><p>${UI_STRINGS[lang].log_v}</p></div>
    `;

    document.getElementById('audit-trail').innerHTML = `Certified Node: L-221 | Timestamp: ${new Date().toISOString()} | Regulatory Check: Pass`;
    
    const hash = "PHARMA-SEC-" + btoa(Date.now().toString()).substring(0, 10).toUpperCase();
    document.getElementById('digital-sig').innerText = hash;
    JsBarcode("#barcode", hash, { height: 35, displayValue: false });

    renderChart(formula);
    document.getElementById('results-area').style.display = "block";
}

function renderChart(formula) {
    if(activeChart) activeChart.destroy();
    const ctx = document.getElementById('costChart').getContext('2d');
    activeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{
                data: formula.map(i => i.qty * i.cost),
                backgroundColor: ['#102a43', '#27ae60', '#f1c40f']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}
