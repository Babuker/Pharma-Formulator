const translations = {
    en: {
        title: "PharmaFormulator Pro",
        api: "Active Ingredient & Dose (mg)",
        ref: "Reference Standard",
        form: "Dosage Form",
        goal: "Strategy",
        run: "Generate Formula",
        m: "Material", r: "Role", q: "Qty (mg)", c: "Cost ($)",
        tablet: "Plain Tablet", coated: "Coated Tablet", capsule: "Capsule", syrup: "Liquid Syrup"
    },
    ar: {
        title: "مُصمم التركيبات الدوائية",
        api: "المادة الفعالة والجرعة (ملجم)",
        ref: "المرجعية الدولية",
        form: "الشكل الدوائي",
        goal: "الاستراتيجية",
        run: "حساب التركيبة المثالية",
        m: "المادة", r: "الوظيفة", q: "الكمية", c: "التكلفة",
        tablet: "قرص عادي", coated: "قرص مغلف", capsule: "كبسولة", syrup: "شراب سائل"
    }
};

let chartInstance = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l] || translations.en;
    document.title = t.title;
    document.getElementById('main-title').innerText = t.title;
    // تطبيق اتجاه النص للعربية
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
}

function runFormulator() {
    const apiName = document.getElementById('api-name').value || "API";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const form = document.getElementById('dosage-form').value;
    const strategy = document.getElementById('strategy').value;

    // خوارزمية الحساب الصيدلاني بناءً على نوع الجرعة
    let formula = [
        { name: apiName, role: "Active Ingredient", qty: dose, price: 0.001 }
    ];

    if (form === "tablet" || form === "coated") {
        formula.push({ name: "Microcrystalline Cellulose", role: "Filler", qty: dose * 0.4, price: 0.0002 });
        formula.push({ name: "Croscarmellose", role: "Disintegrant", qty: dose * 0.04, price: 0.0005 });
        formula.push({ name: "Magnesium Stearate", role: "Lubricant", qty: dose * 0.01, price: 0.0008 });
    } else if (form === "capsule") {
        formula.push({ name: "Starch 1500", role: "Filler", qty: dose * 0.3, price: 0.0001 });
        formula.push({ name: "Colloidal Silicon", role: "Glidant", qty: dose * 0.02, price: 0.0009 });
    }

    renderResults(formula);
}

function renderResults(data) {
    let html = "";
    data.forEach(item => {
        let cost = (item.qty * item.price).toFixed(4);
        html += `<tr><td>${item.name}</td><td>${item.role}</td><td>${item.qty.toFixed(2)}</td><td>${cost}</td></tr>`;
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
                backgroundColor: ['#2c3e50', '#27ae60', '#3498db', '#f1c40f', '#e74c3c']
            }]
        }
    });
}
