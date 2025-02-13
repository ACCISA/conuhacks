import streamlit as st
import logging
import sys


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

sys.path.append('streamlit')

from csv_processing import csv_processing, csv_processing_prediction
from resource_update import resource_update_units, resource_update_cost, resource_update_depl
from analytics import metric_total, metric_support, metric_signup, metric_resource, metric_graph

if 'component' not in st.query_params:
    st.write("missing component param")
else:

    params = st.query_params

    pages = {
        "csv_processing":csv_processing,
        "csv_processing_prediction":csv_processing_prediction,
        "resource_update_units":resource_update_units,
        "resource_update_cost":resource_update_cost,
        "resource_update_depl":resource_update_depl,
        "metric_total": metric_total,
        "metric_support": metric_support,
        "metric_signup": metric_signup,
        "metric_resource": metric_resource,
        "metric_graph": metric_graph
    }

    logging.info("Executing: " + str(params.component))

    pages[params.component]()