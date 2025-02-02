import sys
import streamlit as st
import logging
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import pydeck as pdk

# Set up logging
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

# Apply dark theme
st.set_page_config(page_title="Fire Department Analytics Dashboard", layout="wide")

# Function to create styled bar charts
def create_bar_chart(data, x, y, title, color):
    fig, ax = plt.subplots(figsize=(3, 1.5))  # Reduced size
    ax.bar(data[x], data[y], color=color, edgecolor='white', linewidth=1)
    ax.set_title(title, fontsize=8, weight='bold', color='white')
    ax.tick_params(colors='white', labelsize=6)
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    plt.grid(axis='y', linestyle='--', alpha=0.3)
    fig.patch.set_facecolor('#202124')
    ax.set_facecolor('#202124')
    fig.subplots_adjust(left=0.15, right=0.95, top=0.85, bottom=0.15)
    return fig

# Function to create styled line graph
def create_line_graph(data, x, y, title, color):
    fig, ax = plt.subplots(figsize=(3, 1.5))  # Reduced size
    ax.plot(data[x], data[y], marker='o', color=color, linewidth=2)
    ax.set_title(title, fontsize=8, weight='bold', color='white')
    ax.tick_params(colors='white', labelsize=6)
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    plt.grid(axis='y', linestyle='--', alpha=0.3)
    fig.patch.set_facecolor('#202124')
    ax.set_facecolor('#202124')
    fig.subplots_adjust(left=0.15, right=0.95, top=0.85, bottom=0.15)
    return fig

# Function to create diagram chart (horizontal bar chart)
def create_diagram_chart(data, labels, title, colors):
    fig, ax = plt.subplots(figsize=(3, 1.5))  # Reduced size
    ax.barh(labels, data, color=colors, edgecolor='white')
    ax.set_title(title, fontsize=8, weight='bold', color='white')
    ax.tick_params(colors='white', labelsize=6)
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    plt.grid(axis='x', linestyle='--', alpha=0.3)
    fig.patch.set_facecolor('#202124')
    ax.set_facecolor('#202124')
    fig.subplots_adjust(left=0.15, right=0.95, top=0.85, bottom=0.15)
    return fig

# Function to create metrics card
def create_metric(title, value, delta, color):
    st.markdown(f"""
        <div style='background-color:#303134;padding:10px;border-radius:8px;text-align:center;height:120px;display:flex;flex-direction:column;justify-content:center;margin-bottom:10px;'>
            <h4 style='color:white;font-size:12px;'>{title}</h4>
            <h2 style='color:{color};font-size:16px;'>{value}</h2>
            <p style='color:lightgray;font-size:10px;'>Change: {delta}</p>
        </div>
    """, unsafe_allow_html=True)

def analytics():
    st.markdown("""
        <style>
            .main {background-color: #202124; color: white;}
            .block-container {padding-top: 10px; padding-left: 5px; padding-right: 5px;}
        </style>
    """, unsafe_allow_html=True)

    st.markdown("<p style='text-align: center; color: black;'>.</p>", unsafe_allow_html=True)

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

    # Adding context text
    st.markdown("## Fire Department Resource Allocation Overview")
    st.markdown("This dashboard provides insights into fire incidents, resource usage, and cost analysis to support data-driven decision-making.")

    # Filter Section
    selected_resource = st.selectbox("Filter by Resource", options=cost_df['Resource'].unique())
    filtered_df = cost_df[cost_df['Resource'] == selected_resource]

    # Metrics Row
    col1, col2, col3, col4 = st.columns(4, gap="small")
    with col1:
        create_metric("Total Fires", "512", "+15", "#FF6B6B")
    with col2:
        create_metric("Support Calls", "389", "-8", "#FFD93D")
    with col3:
        create_metric("Sign Ups", "742", "+27", "#6BCB77")
    with col4:
        create_metric("Resource Deployment", "72%", "+5%", "#1E90FF")

    st.markdown("<div style='margin-bottom: 20px;'></div>", unsafe_allow_html=True)

    col5, col6 = st.columns(2, gap="small")
    with col5:
        fig1 = create_bar_chart(cost_df, 'Resource', 'Cost', '💰 Cost of Fire Department Resources', '#1E90FF')
        st.pyplot(fig1)

    with col6:
        st.markdown("### Resource Location Map")

        selected_row = st.selectbox("Select Incident ID to Zoom", filtered_df['Incident ID'].unique())
        selected_data = filtered_df[filtered_df['Incident ID'] == selected_row].iloc[0]

        view_state = pdk.ViewState(
            latitude=selected_data['Latitude'],
            longitude=selected_data['Longitude'],
            zoom=10,  # Zoom into the selected point
            pitch=0
        )

        layer = pdk.Layer(
            'ScatterplotLayer',
            data=filtered_df,
            get_position='[Longitude, Latitude]',
            get_color='[200, 30, 0, 160]',
            get_radius=20000,
        )

        r = pdk.Deck(
            layers=[layer],
            initial_view_state=view_state,
            tooltip={"text": "{Resource}: ${Cost}, Incident ID: {Incident ID}"}
        )

        st.pydeck_chart(r)

    # Data Table with Filtering
    st.markdown("### Resource Cost and Usage Table")
    st.dataframe(filtered_df)

    if st.button('Download as CSV'):
        csv = filtered_df.to_csv(index=False)
        st.download_button(label="Download CSV", data=csv, file_name='fire_data.csv', mime='text/csv')

if __name__ == "__main__":
    analytics()
