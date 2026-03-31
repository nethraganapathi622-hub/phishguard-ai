import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Create small sample dataset
data = {
    "text": [
        "Click here to reset your bank password",
        "Your account has been suspended verify now",
        "Meeting tomorrow at 10am",
        "Project report attached",
        "Urgent: update your payment details",
        "Let's catch up for lunch"
    ],
    "label": [1,1,0,0,1,0]  # 1 = phishing, 0 = safe
}

df = pd.DataFrame(data)

X = df["text"]
y = df["label"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2)

# ML pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression())
])

# Train
model.fit(X_train,y_train)

# Save model
pickle.dump(model,open("model.pkl","wb"))

print("Model trained and saved as model.pkl")