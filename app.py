import streamlit as st
import pandas as pd
import plotly.express as px
from translations import lang_dict

# اختيار اللغة (English الافتراضي)
selected_lang = st.sidebar.selectbox("🌐 Language / اللغة", ["English", "العربية", "Français", "Deutsch"])
t = lang_dict[selected_lang]

# اتجاه الصفحة بناءً على اللغة
if selected_lang == "العربية":
    st.markdown("""<style> body { direction: rtl; text-align: right; } </style>""", unsafe_allow_html=True)

st.title(f"🧪 {t['title']}")

# --- المدخلات ---
st.sidebar.header(t['input_header'])
api_name = st.sidebar.text_input(t['active_name'], "Paracetamol")
ref = st.sidebar.selectbox(t['reference'], ["USP", "BP", "EUP"])
d_form = st.sidebar.selectbox(t['form'], ["Tablet", "Capsule", "Liquid Syrup", "Dry Syrup"])
goal = st.sidebar.selectbox(t['goal'], ["Economic", "Quality", "Balanced"])

# --- محرك الحساب الافتراضي ---
def generate_formula(api_name, goal_type):
    # بيانات تجريبية لمحاكاة النتائج
    data = {
        t['active_name']: [api_name, "Excipient A", "Excipient B", "Lubricant"],
        t['qty'] + " (mg)": [500, 150, 50, 10],
        t['ratio']: [70.4, 21.1, 7.0, 1.4],
        t['cost'] + " ($)": [0.45, 0.05, 0.02, 0.01]
    }
    return pd.DataFrame(data)

df = generate_formula(api_name, goal)

# --- عرض النتائج ---
st.subheader(t['result_table'])
st.dataframe(df, use_container_width=True)

# المخطط الدائري

fig = px.pie(df, values=t['qty'] + " (mg)", names=t[list(t.keys())[2]], title=t['chart_title'])
st.plotly_chart(fig)

# زر التصدير
if st.button(t['export_pdf']):
    st.info("Generating PDF... (This feature requires fpdf library)")
