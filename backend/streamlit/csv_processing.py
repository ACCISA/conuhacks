import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import sys


sys.path.append("database")

from database import csv_to_mongo


def csv_processing():

    st.title("CSV Content")

    csv_file = st.file_uploader("Upload CSV", type="csv")

    if csv_file is not None:
        st.write("CSV Uploaded")

        df = pd.read_csv(csv_file)

        st.subheader("Data Preview")

        st.write(df.head())

        st.subheader("Data Summary")

        st.write(df.describe())

        st.subheader('Filter Data')
        columns = df.columns.tolist()

        selected_column = st.selectbox("Select column to filter", columns)
        unique_values = df[selected_column].unique()
        selected_value = st.selectbox("Select value", unique_values)

        filter_df = df[df[selected_column] == selected_value]
        st.write(filter_df)

        st.subheader("Plot Data")

        x_column = st.selectbox("Select x-axis columns", columns)
        y_column = st.selectbox("Select y-axis columns", columns)

        if st.button("Generate Plot"):
            st.line_chart(filter_df.set_index(x_column)[y_column])

def csv_processing_prediction():
    st.title("Prediction Dataset")
    st.subheader("Insert a dataset to update and train the fire detection prediction model")

    csv_file = st.file_uploader("Upload CSV", type="csv")

    if csv_file is not None:
        st.write("CSV Uploaded")

        df = pd.read_csv(csv_file)

        if st.button('Train'):
            print(df.to_dict(orient='records'))
            csv_to_mongo(csv_file.name,df.to_dict(orient='records'))

        st.subheader("Data Preview")

        st.write(df.head())
        st.subheader("Data Summary")
        
        st.write(df.describe())

        st.subheader('Filter Data')
        columns = df.columns.tolist()

        selected_column = st.selectbox("Select column to filter", columns)
        unique_values = df[selected_column].unique()
        selected_value = st.selectbox("Select value", unique_values)

        filter_df = df[df[selected_column] == selected_value]
        st.write(filter_df)

        st.subheader("Plot Data")

        x_column = st.selectbox("Select x-axis columns", columns)
        y_column = st.selectbox("Select y-axis columns", columns)

        if st.button("Generate Plot"):
            st.line_chart(filter_df.set_index(x_column)[y_column])
        