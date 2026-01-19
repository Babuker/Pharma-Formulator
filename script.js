const DB = {
    fillers: [
        { id: "f1", ar: "لاكتوز", en: "Lactose", cost: 0.00008 },
        { id: "f2", ar: "سيليلوز", en: "MCC PH102", cost: 0.00012 }
    ],
    binders: [
        { id: "b1", ar: "بوفيدون", en: "PVP K30", cost: 0.00045 },
        { id: "b2", ar: "هيدروكسي", en: "HPMC E5", cost: 0.00035 }
    ]
};

const UI = {
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية العالمي",
        btn: "توليد التقرير الأمني", api: "بيانات المادة الفعالة", batch: "حجم التشغيلة",
        th_m: "المادة", th_r: "الدور", th_q: "الكمية", th_c: "التكلفة %",
        log_p: "عدد المنصات (Pallets)", log_a: "المساحة المطلوبة", log_c: "التكلفة الإجمالية",
        hash: "بصمة التشفير الأمنية:", foot: "© 2026 جميع الحقوق محفوظة - حماية تجارية عالمية"
    },
    en: {
        title: "PharmaFormulator Pro", sub: "Global Manufacturing & Logistics Suite",
        btn: "Generate Secure Report", api: "API Information", batch: "Batch Size",
        th_m: "Material", th_r: "Role", th_q: "Quantity", th_c: "Cost %",
        log_p: "Total Pallets", log_a: "Warehouse Space", log_c: "Total Batch Cost",
        hash: "Security Encryption Hash:", foot: "© 2026 Intellectual Property Protected - Global Trade Secret"
    }
};

let costChart = null;

window.onload = () => {
    updateUI();
};

function updateUI() {
    const lang = document.getElementById('lang').value;
    const t = UI[lang];
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.sub;
    document.getElementById('btn-run').innerText = t.btn;
    document.getElementById('lbl-api').innerText = t.api;
    document.getElementById('lbl-batch').innerText = t.batch;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('th-c').innerText = t.th_c;
    document.getElementById('footer-text').innerText = t.foot;

    // تحديث القوائم
    const fill = (el, data) => {
        document.getElementById(el).innerHTML = data.map(i => `<option value="${i.id}">${lang === 'ar' ? i.ar : i.en}</option>`).join('');
    };
    fill('filler-select', DB.fillers);
    fill('binder-select', DB.binders);
}

function runFormulator() {
    const lang = document.getElementById('lang').value;
    const units = parseInt(document.getElementById('batch-units').value);
    const mode = document.getElementById('cost-mode').value;
    const apiDose = parseFloat(document.getElementById('api-dose').value);
    
    let selectedFiller, selectedBinder;

    if(mode === 'auto') {
        // ذكاء اصطناعي لتحسين التكلفة: اختيار الأرخص
        selectedFiller = DB.fillers.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        selectedBinder = DB.binders.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
    } else {
        selectedFiller = DB.fillers.find(i => i.id === document.getElementById('filler-select').value);
        selectedBinder = DB.binders.find(i => i.id === document.getElementById('binder-select').value);
    }

    const formula = [
        { name: document.getElementById('api-name').value || "API", role: "Active", qty: apiDose, cost: 0.005 },
        { name: lang === 'ar' ? selectedFiller.ar : selectedFiller.en, role: "Filler", qty: apiDose * 0.6, cost: selectedFiller.cost },
        { name: lang === 'ar' ? selectedBinder.ar : selectedBinder.en, role: "Binder", qty: apiDose * 0.1, cost: selectedBinder.cost }
    ];

    renderReport(formula, units, lang);
}

function renderReport(formula, units, lang) {
    const totalUnitCost = formula.reduce((sum, item) => sum + (item.qty * item.cost), 0);
    
    // 1. الجدول
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td>${i.name}</td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${(((i.qty * i.cost) / totalUnitCost) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // 2. سجل المراجعة (Audit Trail)
    const now = new Date();
    document.getElementById('audit-trail').innerHTML = `Generated: ${now.toLocaleString()} | Auth: System_Admin_01`;

    // 3. اللوجستيات
    const pallets = Math.ceil(units / 4000);
    const space = (pallets * 1.5).toFixed(1);
    const totalCost = (totalUnitCost * units).toLocaleString();
    
    document.getElementById('logistics-data').innerHTML = `
        <div class="info-box"><h3>${pallets}</h3><p>${UI[lang].log_p}</p></div>
        <div class="info-box"><h3>${space} m²</h3><p>${UI[lang].log_a}</p></div>
        <div class="info-box"><h3>$${totalCost}</h3><p>${UI[lang].log_c}</p></div>
    `;

    // 4. البصمة الرقمية والباركود
    const hash = "SEC-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    document.getElementById('digital-sig').innerText = hash;
    JsBarcode("#barcode", hash, { height: 30, fontSize: 12 });

    // 5. الرسم البياني
    updateChart(formula);

    document.getElementById('results-area').style.display = "block";
}

function updateChart(formula) {
    if(costChart) costChart.destroy();
    const ctx
