// 1. قاعدة بيانات المواد الاحترافية
const MATERIAL_DB = {
    fillers: [
        { id: "mcc", name_en: "MCC PH102", name_ar: "سيليلوز دقيق التبلور", costMg: 0.00012 },
        { id: "lac", name_en: "Lactose Monohydrate", name_ar: "لاكتوز أحادي المادة", costMg: 0.00008 }
    ],
    binders: [
        { id: "pvp", name_en: "PVP K30", name_ar: "بوفيدون K30", costMg: 0.00045 },
        { id: "hpmc", name_en: "HPMC E5", name_ar: "هيدروكسي بروبيل", costMg: 0.0006 }
    ],
    lubricants: [
        { id: "mags", name_en: "Magnesium Stearate", name_ar: "ستيرات المغنيسيوم", costMg: 0.00055 },
        { id: "talc", name_en: "Purified Talc", name_ar: "تالك نقي", costMg: 0.0001 }
    ]
};

// 2. نظام الترجمة الشامل
const translations = {
    en: {
        title: "PharmaFormulator Pro", subtitle: "Enterprise Manufacturing & Logistics System",
        run: "Generate Global Report", table_h: "1. Formulation Composition",
        batch_h: "2. Batch & Analytics", storage_h: "3. Logistics Requirements",
        th_m: "Material", th_r: "Function", th_q: "Qty/Unit",
        lbl_api: "API Name & Dose (mg)", lbl_batch: "Batch Size (Units)",
        lbl_ex: "Excipient Selection", lbl_form: "Dosage Form",
        ip: "© 2026 Intellectual Property Reserved. Trade Secret Protection.",
        pdf: "Download Security Report", units: "Units", weight: "Total Weight", cost: "Total Cost"
    },
    ar: {
        title: "فارما فورميوليتور برو", subtitle: "نظام التصنيع والخدمات اللوجستية للمؤسسات",
        run: "توليد التقرير العالمي", table_h: "1. تركيب الصيغة الدوائية",
        batch_h: "2. تحليل التشغيلة", storage_h: "3. المتطلبات اللوجستية",
        th_m: "المادة", th_r: "الوظيفة", th_q: "الكمية/الوحدة",
        lbl_api: "اسم المادة الفعالة والجرعة (ملجم)", lbl_batch: "حجم التشغيلة (وحدة)",
        lbl_ex: "اختيار المواد المضافة", lbl_form: "الشكل الصيدلاني",
        ip: "© 2026 جميع حقوق الملكية الفكرية محفوظة. حماية الأسرار التجارية.",
        pdf: "تحميل التقرير الأمني", units: "وحدة", weight: "الوزن الكلي", cost: "التكلفة الكلية"
    }
};

// 3. تهيئة النظام
window.onload = () => {
    populateDropdowns();
    updateUI();
};

function populateDropdowns() {
    const l = document.getElementById('lang').value;
    const fill = (id, data) => {
        document.getElementById(id).innerHTML = data.map(item => 
            `<option value="${item.id}">${l === 'en' ? item.name_en : item.name_ar}</option>`).join('');
    };
    fill('filler-select', MATERIAL_DB.fillers);
    fill('binder-select', MATERIAL_DB.binders);
    fill('lubricant-select', MATERIAL_DB.lubricants);
}

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.subtitle;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('lbl-api').innerText = t.lbl_api;
    document.getElementById('lbl-batch').innerText = t.lbl_batch;
    document.getElementById('lbl-excipients').innerText = t.lbl_ex;
    document.getElementById('lbl-form').innerText = t.lbl_form;
    document.getElementById('h-table').innerText = t.table_h;
    document.getElementById('h-batch').innerText = t.batch_h;
    document.getElementById('h-storage').innerText = t.storage_h;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('ip-text').innerText = t.ip;
    document.getElementById('btn-pdf').innerText = t.pdf;

    populateDropdowns();
}

// 4. منطق التصنيع والخدمات اللوجستية
function runFormulator() {
    const l = document.getElementById('lang').value;
    const apiName = document.getElementById('api-name').value || "API-001";
    const dose = parseFloat(document.getElementById('api-dose').value);
    const units = parseInt(document.getElementById('batch-units').value);
    const form = document.getElementById('dosage-form').value;

    const filler = MATERIAL_DB.fillers.find(i => i.id === document.getElementById('filler-select').value);
    const binder = MATERIAL_DB.binders.find(i => i.id === document.getElementById('binder-select').value);
    const lubricant = MATERIAL_DB.lubricants.find(i => i.id === document.getElementById('lubricant-select').value);

    let formula = [
        { name: apiName, role: (l==='en'?'Active':'فعال'), qty: dose, costMg: 0.008 }
    ];

    if (form === "tablet") {
        formula.push({ name: (l==='en'?filler.name_en:filler.name_ar), role: (l==='en'?'Filler':'مالئ'), qty: dose * 0.5, costMg: filler.costMg });
        formula.push({ name: (l==='en'?binder.name_en:binder.name_ar), role: (l==='en'?'Binder':'رابط'), qty: dose * 0.05, costMg: binder.costMg });
        formula.push({ name: (l==='en'?lubricant.name_en:lubricant.name_ar), role: (l==='en'?'Lubricant':'مزلق'), qty: dose * 0.02, costMg: lubricant.costMg });
    }

    renderReport(formula, units, apiName, form, l);
}

function renderReport(formula, units, apiName, form, l) {
    const t = translations[l];
    const unitWt = formula.reduce((s, i) => s + i.qty, 0);
    const unitCost = formula.reduce((s, i) => s + (i.qty * i.costMg), 0);

    // جدول المواد
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td>${i.name}</td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(2)} mg</td>
            <td>${((i.qty/unitWt)*100).toFixed(1)}%</td>
            <td>${(((i.qty*i.costMg)/unitCost)*100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // ملخص التشغيلة
    document.getElementById('batch-summary').innerHTML = `
        <div class="info-item">${t.units}: ${units.toLocaleString()}</div>
        <div class="info-item">${t.weight}: ${((unitWt * units)/1000000).toFixed(2)} Kg</div>
        <div class="info-item">${t.cost}: $${(unitCost * units).toLocaleString()}</div>
    `;

    // حساب اللوجستيات
    const boxes = Math.ceil(units / (form === 'tablet' ? 100 : 24));
    const pallets = Math.ceil(boxes / 40);
    const area = (pallets * 1.2 * 0.8 * 1.3).toFixed(2);

    document.getElementById('storage-info').innerHTML = `
        <div>
            <p><strong>📦 Total Boxes:</strong> ${boxes}</p>
            <p><strong>🏗️ Pallets Required:</strong> ${pallets}</p>
        </div>
        <div>
            <p><strong>📏 Floor Space:</strong> ${area} $m^2$</p>
            <p><strong>🌡️ Condition:</strong> ${form==='tablet'?'< 30°C':'15-25°C'}</p>
        </div>
    `;

    // أمان وتتبع
    const hash = "PF-" + btoa(apiName + units).substring(0, 12).toUpperCase();
    document.getElementById('batch-hash').innerText = hash;
    JsBarcode("#barcode", hash, { height: 30, fontSize: 12 });

    document.getElementById('results').style.display = "block";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PharmaFormulator Global Enterprise Report", 10, 10);
    doc.autoTable({ html: '#formula-table' });
    doc.save("Manufacturing_Report.pdf");
}
