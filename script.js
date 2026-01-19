const translations = {
    en: { title: "PharmaFormulator Pro", run: "Analyze & Generate", pdf: "Export PDF Report" },
    ar: { title: "خبير الصياغة الدوائية", run: "تحليل وتوليد التركيبة", pdf: "تصدير التقرير الفني" }
};

let chartInstance = null;

function runAIFormulator() {
    const apiName = document.getElementById('api-name').value || "Active Ingredient";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const batchSize = parseInt(document.getElementById('batch-units').value);
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;

    // --- 1. خوارزمية AI للتغليف (Packaging Logic) ---
    // هذه محاكاة لـ Rule-based Expert System
    let packagingRec = "";
    let aiLogic = "";

    if (form === "tablet" || form === "coated") {
        packagingRec = "ALU/ALU Blister (Best for stability)";
        aiLogic = "Decision Logic: Physical protection required for compression integrity.";
    } else if (form === "capsule") {
        packagingRec = "PVC/PVDC Blister or Bottle with Desiccant";
        aiLogic = "Decision Logic: Hygroscopic nature of gelatin shells detected.";
    } else {
        packagingRec = "Amber Glass Bottle (Type III) or PET Bottle";
        aiLogic = "Decision Logic: Light sensitivity protection (UV blocking) required.";
    }

    // --- 2. حساب المكونات والتشغيلة ---
    let formula = [ { name: apiName, role: "API", qty: dose, cost: 0.0005 } ];
    
    // قواعد إضافة المواد بناءً على الشكل
    if (form.includes("tablet")) {
        formula.push({ name: "MCC (Filler)", role: "Excipient", qty: dose * 0.45, cost: 0.0001 });
        formula.push({ name: "Croscarmellose", role: "Disintegrant", qty: dose * 0.04, cost: 0.0002 });
    } else if (form === "syrup") {
        formula.push({ name: "Sucrose Syrup", role: "Vehicle", qty: dose * 8, cost: 0.00005 });
    }

    // --- 3. عرض النتائج ---
    displayResults(formula, batchSize, ref, packagingRec, aiLogic);
}

function displayResults(formula, batchSize, ref, pack, logic) {
    let totalUnitWeight = formula.reduce((s, i) => s + i.qty, 0);
    let totalBatchCost = formula.reduce((s, i) => s + (i.qty * i.cost * batchSize), 0);

    // تحديث الملخص
    document.getElementById('sum-unit-weight').innerText = totalUnitWeight.toFixed(2) + " mg";
    document.getElementById('sum-batch-size').innerText = ((totalUnitWeight * batchSize) / 1000000).toFixed(2) + " kg";
    document.getElementById('sum-total-cost').innerText = totalBatchCost.toLocaleString();
    document.getElementById('sum-ref').innerText = ref;
    
    // تحديث توصية AI
    document.getElementById('ai-packaging-tip').innerText = "Recommendation: " + pack;
    document.getElementById('ai-logic-note').innerText = logic;

    // ملء الجدول
    let html = "";
    formula.forEach(item => {
        html += `<tr><td>${item.name}</td><td>${item.role}</td><td>${item.qty.toFixed(2)}</td><td>${((item.qty * batchSize)/1000).toFixed(2)} g</td></tr>`;
    });
    document.getElementById('table-body').innerHTML = html;
    document.getElementById('results').style.display = "block";
    
    updateChart(formula);
}

function updateChart(data) {
    const ctx = document.getElementById('ctxChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(i => i.name),
            datasets: [{ data: data.map(i => i.qty), backgroundColor: ['#1a2a6c', '#b21f1f', '#fdbb2d', '#2ecc71'] }]
        }
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("PharmaFormulator AI Report", 14, 20);
    doc.setFontSize(10);
    doc.text("Batch Recommendation & Analysis", 14, 30);
    doc.autoTable({ html: '#formula-table', startY: 40 });
    doc.save("Batch_Report.pdf");
}

function updateUI() {
    const l = document.getElementById('lang').value;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
}
