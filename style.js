/**
 * PharmaFormulator Pro - AI Logic Core
 * تم تصحيحه ليعمل بذكاء على GitHub Pages
 */

const translations = {
    en: {
        title: "PharmaFormulator Pro",
        api: "Active Ingredient & Dose",
        batch: "Batch Size (Units)",
        run: "Run AI Analysis",
        unitWeight: "Unit Weight",
        batchWeight: "Total Batch",
        cost: "Batch Cost",
        ref: "Reference",
        packing: "AI Packaging Recommendation",
        pdf: "Download Report"
    },
    ar: {
        title: "مُصمم التركيبات الدوائية (إصدار AI)",
        api: "المادة والجرعة (ملجم)",
        batch: "حجم التشغيلة (وحدة)",
        run: "تشغيل التحليل الذكي",
        unitWeight: "وزن الوحدة",
        batchWeight: "وزن التشغيلة",
        cost: "تكلفة التشغيلة",
        ref: "المرجع الدولي",
        packing: "توصية التغليف الذكية",
        pdf: "تحميل التقرير الفني"
    }
};

let chartInstance = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l] || translations.en;
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('lbl-api').innerText = t.api;
    document.getElementById('lbl-batch').innerText = t.batch;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('btn-pdf').innerText = t.pdf;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
}

function runAIFormulator() {
    const name = document.getElementById('api-name').value || "Active Ingredient";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const batchUnits = parseInt(document.getElementById('batch-units').value) || 1000;
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;

    // --- خوارزمية AI للتغليف ---
    let packingAdvice = "";
    let aiLogic = "";
    
    if (form === "tablet") {
        packingAdvice = "Blister Pack (ALU/PVC) - [Recommended for stability]";
        aiLogic = "AI Analysis: Compression force requires rigid physical protection.";
    } else if (form === "coated") {
        packingAdvice = "Strip Pack or Alu-Alu Blister - [Max light protection]";
        aiLogic = "AI Analysis: Coating detected; protecting from photo-degradation.";
    } else if (form === "capsule") {
        packingAdvice = "HDPE Bottle with Silica Gel or PTP Blister";
        aiLogic = "AI Analysis: Moisture sensitivity detected in gelatin shell.";
    } else {
        packingAdvice = "Amber Glass Bottle (Class III) - [UV Protection]";
        aiLogic = "AI Analysis: Oxidation risk detected in liquid phase.";
    }

    // --- خوارزمية الحسابات الدوائية ---
    let formula = [ { name: name, role: "API", qty: dose, costMg: 0.0006 } ];
    
    // إضافة مواد بناءً على الشكل
    if (form.includes("tablet")) {
        formula.push({ name: "Avicel PH102", role: "Binder/Filler", qty: dose * 0.4, costMg: 0.0001 });
        formula.push({ name: "Sodium Starch Glycolate", role: "Disintegrant", qty: dose * 0.05, costMg: 0.0003 });
        formula.push({ name: "Magnesium Stearate", role: "Lubricant", qty: dose * 0.01, costMg: 0.0005 });
    } else if (form === "syrup") {
        formula.push({ name: "Sugar Syrup (66%)", role: "Vehicle", qty: dose * 10, costMg: 0.00004 });
        formula.push({ name: "Methylparaben", role: "Preservative", qty: dose * 0.02, costMg: 0.001 });
    }

    processResults(formula, batchUnits, ref, packingAdvice, aiLogic);
}

function processResults(data, units, ref, advice, logic) {
    let totalUnitQty = data.reduce((s, i) => s + i.qty, 0);
    let totalBatchCost = data.reduce((s, i) => s + (i.qty * i.costMg * units), 0);
    let totalBatchWeightKg = (totalUnitQty * units) / 1000000;

    // تحديث العرض
    document.getElementById('sum-unit-weight').innerText = totalUnitQty.toFixed(2) + " mg";
    document.getElementById('sum-batch-size').innerText = totalBatchWeightKg.toFixed(2) + " kg";
    document.getElementById('sum-total-cost').innerText = totalBatchCost.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('sum-ref').innerText = ref;
    
    document.getElementById('ai-packaging-tip').innerHTML = `<strong>${advice}</strong>`;
    document.getElementById('ai-logic-note').innerText = logic;

    let html = "";
    data.forEach(item => {
        let bQty = (item.qty * units) / 1000; // التحويل لجرام
        html += `<tr><td>${item.name}</td><td>${item.role}</td><td>${item.qty.toFixed(2)} mg</td><td>${bQty.toFixed(2)} g</td></tr>`;
    });
    document.getElementById('table-body').innerHTML = html;
    document.getElementById('results').style.display = "block";
    
    updateChart(data);
}

function updateChart(data) {
    const ctx = document.getElementById('ctxChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(i => i.name),
            datasets: [{
                data: data.map(i => i.qty),
                backgroundColor: ['#1a2a6c', '#b21f1f', '#27ae60', '#f39c12', '#7f8c8d']
            }]
        }
    });
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Professional Formulation Report", 15, 20);
    doc.setFontSize(10);
    doc.text("AI-Driven Pharmaceutical Composition Analysis", 15, 28);
    doc.autoTable({ html: '#formula-table', startY: 35, theme: 'grid' });
    doc.save("Pharma_Formulation_Batch.pdf");
}

// تشغيل الواجهة
updateUI();
