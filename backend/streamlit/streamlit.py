import streamlit as st
import logging
from csv_processing import csv_processing


params = st.query_params

pages = {
    "csv_processing":csv_processing
}

logging.info("Executing: " + str(params.component))

pages[params.component]()

