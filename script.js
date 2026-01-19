// إضافة مكتبة الباركود برمجياً
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
document.head.appendChild(script);

const translations = {
    en: { run: "Generate Formulation", batch: "Batch Info", rec: "Recommendations", pdf: "Export PDF", role_api: "Active (API)", role_filler: "Filler", role_bind: "Binder", role_dis: "Disintegrant", role_lub: "Lubricant" },
    ar: { run: "توليد التركيبة", batch: "معلومات التشغيلة", rec: "التوصيات الإضافية", pdf: "تصدير ملف PDF", role_api: "مادة علاجية فعالة", role_filler: "مادة مالئة", role_bind: "مادة ربط", role_dis: "مادة تفكك", role_lub: "مادة مزلقة" }
};

function updateUI() {
    const l = document.getElementById('lang').value;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('btn-run').innerText = translations[l].run;
}

function runFormulator() {
    const apiName = document.getElementById('api-name').value || "API-101";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const batchUnits = parseInt(document.getElementById('batch-units').value) || 1000;
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;
    const l = document.getElementById('lang').value;
    const t = translations[l];

    // مصفوفة المكونات مع منطق التكلفة والوزن
    let formula = [
        { name: apiName, role: t.role_api, qty: dose, pricePerMg: 0.005 }
    ];

    if (form.includes("tablet")) {
        formula.push({ name: "Avicel PH102", role: t.role_filler, qty: dose * 0.5, pricePerMg: 0.0001 });
        formula.push({ name: "PVP K30", role: t.role_bind, qty: dose * 0.05, pricePerMg: 0.0003 });
        formula.push({ name: "SSG", role: t.role_dis, qty: dose * 0.04, pricePerMg: 0.0002 });
        formula.push({ name: "Mg Stearate", role: t.role_lub, qty: dose * 0.01, pricePerMg: 0.0004 });
    }

    calculateAndDisplay(formula, batchUnits, ref, form, l);
}

function calculateAndDisplay(formula, units, ref, form, l) {
    const unitWeight = formula.reduce((s, i) => s + i.qty, 0);
    const unitCost = formula.reduce((s, i) => s + (i.qty * i.pricePerMg), 0);
    const batchWeight = (unitWeight * units) / 1000000; // Kg
    const batchCost = unitCost * units;

    // 1. جدول التركيبة
    let html = "";
    formula.forEach(item => {
        const weightPct = ((item.qty / unitWeight) * 100).toFixed(1);
        const costPct = (((item.qty * item.pricePerMg) / unitCost) * 100).toFixed(1);
        html += `<tr>
            <td>${item.name}</td>
            <td>${item.role}</td>
            <td>${item.qty.toFixed(2)} mg</td>
            <td>${weightPct}%</td>
            <td>${costPct}%</td>
        </tr>`;
    });
    document.getElementById('table-body').innerHTML = html;

    // 2. معلومات التشغيلة
    document.getElementById('batch-summary').innerHTML = `
        <div class="info-item"><strong>Batch Size:</strong> ${units.toLocaleString()} Units</div>
        <div class="info-item"><strong>Batch Weight:</strong> ${batchWeight.toFixed(3)} Kg</div>
        <div class="info-item"><strong>Unit Weight:</strong> ${unitWeight.toFixed(2)} mg</div>
        <div class="info-item"><strong>Batch Cost:</strong> $${batchCost.toFixed(2)}</div>
        <div class="info-item"><strong>Reference:</strong> ${ref} Standard</div>
    `;

    // 3. التوصيات
    let rec = form === "tablet" ? "Recommended: Blister ALU/PVC. Store below 25°C." : "Recommended: Amber Glass Bottle. Avoid direct light.";
    document.getElementById('ai-rec-text').innerText = rec;

    // 4. الباركود
    JsBarcode("#barcode", apiName + "-" + units, { format: "CODE128", height: 40, displayValue: true });

    document.getElementById('results').style.display = "block";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PharmaFormulator Professional Report", 14, 15);
    doc.autoTable({ html: '#formula-table', startY: 25 });
    doc.save("Formulation_Report.pdf");
}
