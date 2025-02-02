import sys
import streamlit as st
import logging
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import pydeck as pdk

# Set up logging
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

# Apply modern dark theme
st.set_page_config(page_title="Fire Department Analytics Dashboard", layout="wide")

# Custom CSS for aesthetic design
st.markdown("""
    <style>
        body {background-color: #121212; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;}
        .block-container {padding: 20px; max-width: 1200px; margin: auto;}
        .metric-card {background-color: #1E1E1E; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4); transition: transform 0.3s ease;}
        .metric-card:hover {transform: translateY(-5px);}
        .metric-title {font-size: 14px; color: #B0B0B0; font-weight: bold;}
        .metric-value {font-size: 24px; color: #FFFFFF; font-weight: bold;}
        .metric-delta {font-size: 12px; color: #AAAAAA;}
        h2, h4 {color: #FFFFFF;}
        .dataframe {background-color: #1E1E1E; border-radius: 10px; color: white; padding: 10px;}
        .stButton>button {background-color: #1E90FF; color: white; border-radius: 8px; padding: 10px 20px;}
        .stButton>button:hover {background-color: #3A9DFF;}
    </style>
""", unsafe_allow_html=True)

# Function to create styled bar charts
def create_bar_chart(data, x, y, title, color):
    fig, ax = plt.subplots(figsize=(10, 4))  # Wider chart
    ax.bar(data[x], data[y], color=color, edgecolor='white', linewidth=1)
    ax.set_title(title, fontsize=14, weight='bold', color='white')
    ax.tick_params(colors='white', labelsize=10)
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    plt.grid(axis='y', linestyle='--', alpha=0.3)
    fig.patch.set_facecolor('#121212')
    ax.set_facecolor('#121212')
    fig.subplots_adjust(left=0.1, right=0.95, top=0.9, bottom=0.2)
    return fig

# Function to create metrics card
def create_metric(title, value, delta, color):
    st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-title'>{title}</div>
            <div class='metric-value' style='color:{color};'>{value}</div>
            <div class='metric-delta'>Change: {delta}</div>
        </div>
    """, unsafe_allow_html=True)

def analytics():
    logging.info("Analytics page accessed")

    np.random.seed(42)
    resources = ['Smoke Jumpers', 'Fire Engines', 'Helicopters', 'Tanker Planes', 'Ground Crews', 'Rescue Boats', 'Drones']
    cost_data = {
        'Resource': np.random.choice(resources, 500),
        'Cost': np.random.randint(1000, 20000, 500),
        'Latitude': np.random.uniform(45.0, 48.5, 500),
        'Longitude': np.random.uniform(-76.5, -72.2, 500),
        'Incident ID': [f'INC{str(i).zfill(4)}' for i in range(1, 501)]
    }
    cost_df = pd.DataFrame(cost_data)

    st.markdown("Gain valuable insights into fire incidents, resource allocations, and cost management.")

    # Metrics Row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        create_metric("Total Fires", "512", "+15", "#FF6B6B")
    with col2:
        create_metric("Support Calls", "389", "-8", "#FFD93D")
    with col3:
        create_metric("Sign Ups", "742", "+27", "#6BCB77")
    with col4:
        create_metric("Resource Deployment", "72%", "+5%", "#1E90FF")

    st.markdown("<div style='margin: 20px 0;'></div>", unsafe_allow_html=True)

    # Wider Graph Section
    fig1 = create_bar_chart(cost_df, 'Resource', 'Cost', '💰 Resource Costs', '#1E90FF')
    st.pyplot(fig1)

    st.markdown("### 🌍 Incident Locations Map")
    selected_resource = st.selectbox("Filter by Resource", options=cost_df['Resource'].unique())
    filtered_df = cost_df[cost_df['Resource'] == selected_resource]

    selected_row = st.selectbox("Zoom to Incident", filtered_df['Incident ID'].unique())
    selected_data = filtered_df[filtered_df['Incident ID'] == selected_row].iloc[0]

    view_state = pdk.ViewState(
        latitude=selected_data['Latitude'],
        longitude=selected_data['Longitude'],
        zoom=10,
        pitch=0
    )

    layer = pdk.Layer(
        'ScatterplotLayer',
        data=filtered_df,
        get_position='[Longitude, Latitude]',
        get_color='[255, 69, 0, 180]',
        get_radius=20000,
    )

    r = pdk.Deck(
        layers=[layer],
        initial_view_state=view_state,
        tooltip={"text": "{Resource}: ${Cost}, Incident ID: {Incident ID}"}
    )

    st.pydeck_chart(r)

    # Full-width Data Table
    st.markdown("### 📊 Resource Cost & Usage Table")
    st.dataframe(filtered_df, height=400)

    if st.button('📥 Download as CSV'):
        csv = filtered_df.to_csv(index=False)
        st.download_button(label="Download CSV", data=csv, file_name='fire_data.csv', mime='text/csv')

if __name__ == "__main__":
    analytics()
