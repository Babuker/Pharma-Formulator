const translations = {
    en: {
        title: "PharmaFormulator Pro", api: "API Name & Dose (mg)", ref: "Reference", 
        form: "Dosage Form", goal: "Strategy", run: "Generate Formulation", 
        res: "Optimal Composition", m: "Material", r: "Role", q: "Qty", p: "Ratio %", c: "Cost", pdf: "Export PDF Report"
    },
    ar: {
        title: "مُصمم التركيبات الدوائية", api: "المادة الفعالة والجرعة (ملجم)", ref: "المرجعية", 
        form: "الشكل الدوائي", goal: "الاستراتيجية", run: "حساب التركيبة المثالية", 
        res: "التركيبة المقترحة", m: "المادة", r: "الوظيفة", q: "الكمية", p: "النسبة %", c: "التكلفة", pdf: "تصدير تقرير PDF"
    },
    fr: {
        title: "Formulateur Pharma Pro", api: "Nom API & Dose", ref: "Référence", 
        form: "Forme Galénique", goal: "Stratégie", run: "Générer la Formule", 
        res: "Composition Optimale", m: "Matériel", r: "Rôle", q: "Qté", p: "Ratio %", c: "Coût", pdf: "Exporter PDF"
    },
    de: {
        title: "PharmaFormulierer Pro", api: "Wirkstoff & Dosis", ref: "Referenz", 
        form: "Darreichungsform", goal: "Strategie", run: "Formulierung Berechnen", 
        res: "Optimale Mischung", m: "Material", r: "Rolle", q: "Menge", p: "Verhältnis %", c: "Kosten", pdf: "PDF Exportieren"
    }
};

let chartInstance = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('lbl-api').innerText = t.api;
    document.getElementById('lbl-ref').innerText = t.ref;
    document.getElementById('lbl-form').innerText = t.form;
    document.getElementById('lbl-goal').innerText = t.goal;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('res-title').innerText = t.res;
    document.getElementById('th-m').innerText = t.m;
    document.getElementById('th-r').innerText = t.r;
    document.getElementById('th-q').innerText = t.q;
    document.getElementById('th-p').innerText = t.p;
    document.getElementById('th-c').innerText = t.c;
    document.getElementById('btn-pdf').innerText = t.pdf;

    const container = document.getElementById('app-container');
    l === 'ar' ? container.classList.add('rtl') : container.classList.remove('rtl');
}

function runFormulator() {
    const apiName = document.getElementById('api-name').value || "Active Ingredient";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const form = document.getElementById('dosage-form').value;
    const strategy = document.getElementById('strategy').value;

    let formula = [];
    let multiplier = strategy === 'economic' ? 0.8 : (strategy === 'quality' ? 1.2 : 1.0);

    // المنطق الصيدلاني للحساب
    formula.push({ name: apiName, role: "API", qty: dose, cost: dose * 0.002 * multiplier });

    if (form === "tablet" || form === "coated") {
        formula.push({ name: "Microcrystalline Cellulose", role: "Filler", qty: dose * 0.4, cost: dose * 0.4 * 0.0005 });
        formula.push({ name: "Croscarmellose", role: "Disintegrant", qty: dose * 0.04, cost: dose * 0.04 * 0.001 });
        formula.push({ name: "Magnesium Stearate", role: "Lubricant", qty: dose * 0.01, cost: dose * 0.01 * 0.002 });
        if(form === "coated") formula.push({ name: "Opadry Coating", role: "Coating", qty: dose * 0.05, cost: dose * 0.05 * 0.005 });
    } else if (form === "capsule") {
        formula.push({ name: "Starch 1500", role: "Filler", qty: dose * 0.35, cost: dose * 0.3 * 0.0004 });
        formula.push({ name: "Talcum", role: "Glidant", qty: dose * 0.02, cost: dose * 0.02 * 0.0003 });
    } else if (form === "liquid") {
        formula.push({ name: "Sorbitol Solution", role: "Vehicle", qty: dose * 5, cost: dose * 5 * 0.0002 });
        formula.push({ name: "Sodium Benzoate", role: "Preservative", qty: dose * 0.01, cost: 0.01 });
    }

    renderTable(formula);
}

function renderTable(data) {
    const totalQty = data.reduce((s, i) => s + i.qty, 0);
    let html = "";
    data.forEach(item => {
        const p = ((item.qty / totalQty) * 100).toFixed(1);
        html += `<tr><td>${item.name}</td><td>${item.role}</td><td>${item.qty.toFixed(2)}</td><td>${p}%</td><td>$${item.cost.toFixed(3)}</td></tr>`;
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
                backgroundColor: ['#2c3e50', '#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PharmaFormulator Pro - Report", 14, 15);
    doc.autoTable({ html: '#formula-table', startY: 25 });
    doc.save("Formulation_Report.pdf");
}

// تشغيل الواجهة الافتراضية
updateUI();
