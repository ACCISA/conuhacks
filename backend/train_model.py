import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score

# Load historical data
historical_env_df = pd.read_csv("./training_data/historical_environmental_data.csv")
historical_fire_df = pd.read_csv("./training_data/historical_wildfiredata.csv")

# Convert timestamps
historical_env_df["timestamp"] = pd.to_datetime(historical_env_df["timestamp"])
historical_fire_df["timestamp"] = pd.to_datetime(historical_fire_df["timestamp"])

# Label fire occurrences
historical_env_df["fire_risk"] = 0
for _, fire in historical_fire_df.iterrows():
    mask = (
        (historical_env_df["timestamp"].dt.date == fire["timestamp"].date()) &
        (abs(historical_env_df["latitude"] - fire["latitude"]) < 0.01) &
        (abs(historical_env_df["longitude"] - fire["longitude"]) < 0.01)
    )
    historical_env_df.loc[mask, "fire_risk"] = 1

# Feature Engineering
historical_env_df["month"] = historical_env_df["timestamp"].dt.month
historical_env_df["hour"] = historical_env_df["timestamp"].dt.hour
historical_env_df["season"] = historical_env_df["month"].apply(lambda x: 0 if x in [12, 1, 2] else 1 if x in [3, 4, 5] else 2 if x in [6, 7, 8] else 3)
historical_env_df.drop(columns=["timestamp"], inplace=True)

# Train Model
X = historical_env_df.drop(columns=["fire_risk"])
y = historical_env_df["fire_risk"]

# Handle imbalance with SMOTE
smote = SMOTE(sampling_strategy=0.5, random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

rf_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
rf_model.fit(X_train, y_train)

# Save the trained model
joblib.dump(rf_model, "fire_risk_model.pkl")
print("Model saved as fire_risk_model.pkl")


# From GPT
# Model Evaluation
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)
classification_rep = classification_report(y_test, y_pred)
roc_auc = roc_auc_score(y_test, rf_model.predict_proba(X_test)[:, 1])

# Display results
print(f"Model Accuracy: {accuracy:.4f}")
print(f"ROC-AUC Score: {roc_auc:.4f}")
print("Classification Report:")
print(classification_rep)
print("Confusion Matrix:")
print(conf_matrix)
