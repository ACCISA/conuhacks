import streamlit as st


st.write()


st.title("CSV Content")

csv_file = st.file_uploader("Upload CSV", type="csv")

if csv_file is not None:
    st.write("File Uploaded")

    