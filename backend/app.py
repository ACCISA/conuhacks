import streamlit as st
import logging
import sys

sys.path.append('streamlit')

from csv_processing import csv_processing

if 'component' not in st.query_params:
    st.write("missing component param")
else:

    params = st.query_params

    pages = {
        "csv_processing":csv_processing
    }

    logging.info("Executing: " + str(params.component))

    pages[params.component]()