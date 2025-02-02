import streamlit as st
import sys
import os
import logging
 
sys.path.append('database')

from resources import pull_resources, update_resource

def update_value(key, attribute):
    value = st.session_state[key]
    update_resource(key, attribute, value)
    logging.info("Updated "+str(key)+":"+str(value))
    




def resource_update_units():
    resources = pull_resources()['resources']

    st.subheader("Resources Available")
    st.write("Update available resources in real time") 
    smoke_jumpers = st.text_input("Smoke Jumpers",key='smoke_jumpers',placeholder=resources['smoke_jumpers']['units_available'],
                                on_change=lambda: update_value('smoke_jumpers','units_available'))
    fire_engines = st.text_input("Fire Enginers",key='fire_engines',placeholder=resources['fire_engines']['units_available'],
                                on_change=lambda: update_value('fire_engines','units_available'))
    helicopters = st.text_input("Helicopters",key='helicopters',placeholder=resources['helicopters']['units_available'],
                                on_change=lambda: update_value('helicopters','units_available'))
    tanker_planes = st.text_input("Tanker Planes",key='tanker_planes',placeholder=resources['tanker_planes']['units_available'],
                                on_change=lambda: update_value('tanker_planes','units_available'))
    ground_crews = st.text_input("Ground Crews",key='ground_crews',placeholder=resources['ground_crews']['units_available'],
                                on_change=lambda: update_value('ground_crews','units_available'))

def resource_update_cost():
    resources = pull_resources()['resources']

    st.subheader("Deployment Cost")
    st.write("Update deployment cost in real time") 
    smoke_jumpers_cost = st.text_input("Smoke Jumpers",key="sj",placeholder=resources['smoke_jumpers']['cost_per_operation'],
                                on_change=lambda: update_value('smoke_jumpers','cost_per_operation'))
    fire_engines_cost = st.text_input("Fire Enginers",key="fe",placeholder=resources['fire_engines']['cost_per_operation'],
                                on_change=lambda: update_value('smoke_jumpers','cost_per_operation'))
    helicopters_cost = st.text_input("Helicopters",key="h",placeholder=resources['helicopters']['cost_per_operation'],
                                on_change=lambda: update_value('smoke_jumpers','cost_per_operation'))
    tanker_planes_cost = st.text_input("Tanker Planes",key="tp",placeholder=resources['tanker_planes']['cost_per_operation'],
                                on_change=lambda: update_value('smoke_jumpers','cost_per_operation'))
    ground_crews_cost = st.text_input("Ground Crews",key="gc",placeholder=resources['ground_crews']['cost_per_operation'],
                                on_change=lambda: update_value('smoke_jumpers','cost_per_operation'))

def resource_update_depl():
    resources = pull_resources()['resources']

    st.subheader("Deployement Time")
    st.write("Update deployment time in real time") 
    smoke_jumpers_cost = st.text_input("Smoke Jumpers",key="sj",placeholder=resources['smoke_jumpers']['deployment_time'],
                                on_change=lambda: update_value('smoke_jumpers','deployment_time'))
    fire_engines_cost = st.text_input("Fire Enginers",key="fe",placeholder=resources['fire_engines']['deployment_time'],
                                on_change=lambda: update_value('smoke_jumpers','deployment_time'))
    helicopters_cost = st.text_input("Helicopters",key="h",placeholder=resources['helicopters']['deployment_time'],
                                on_change=lambda: update_value('smoke_jumpers','deployment_time'))
    tanker_planes_cost = st.text_input("Tanker Planes",key="tp",placeholder=resources['tanker_planes']['deployment_time'],
                                on_change=lambda: update_value('smoke_jumpers','deployment_time'))
    ground_crews_cost = st.text_input("Ground Crews",key="gc",placeholder=resources['ground_crews']['deployment_time'],
                                on_change=lambda: update_value('smoke_jumpers','deployment_time'))