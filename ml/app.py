from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import pickle
import logging
import re
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="PhishGuard AI", version="1.0.0")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")

try:
    model = pickle.load(open(MODEL_PATH, "rb"))
    logger.info(f"Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    logger.error(f"Model file not found at {MODEL_PATH}")
    model = None
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None


# Request schema
class EmailRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=int(os.getenv("MAX_TEXT_LENGTH", "10000")))

    @validator("text")
    def text_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Email text cannot be empty")
        return v


# Response schema
class ScanResponse(BaseModel):
    result: str
    confidence: float | None = None
    processed_length: int


# Text preprocessing
def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = " ".join(text.split())
    return text

app.mount("/assets", StaticFiles(directory="../phishguard-ai/dist/assets"), name="assets")

@app.get("/")
def serve_frontend():
    return FileResponse("../phishguard-ai/dist/index.html")


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model else "degraded",
        "model_loaded": model is not None
    }


@app.post("/scan", response_model=ScanResponse)
@limiter.limit("10/minute")
def scan_email(request: Request, email: EmailRequest, response: Response):

    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    try:
        # preprocess
        processed_text = preprocess_text(email.text)

        # prediction
        prediction = model.predict([processed_text])[0]

        confidence = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba([processed_text])[0]
            confidence = float(max(probabilities))

        logger.info(
            f"Email scanned - Result: {'Phishing' if prediction == 1 else 'Safe'}, Confidence: {confidence}"
        )

        return ScanResponse(
            result="Phishing Detected" if prediction == 1 else "Safe Email",
            confidence=confidence,
            processed_length=len(processed_text)
        )

    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing email")

@app.post("/scan-url")
def scan_url(url: str):

    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    processed_text = preprocess_text(url)

    prediction = model.predict([processed_text])[0]

    confidence = None
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba([processed_text])[0]
        confidence = float(max(probabilities))

    return {
        "result": "Malicious URL" if prediction == 1 else "Safe URL",
        "confidence": confidence
    }
app.mount("/assets", StaticFiles(directory="../phishguard-ai/dist/assets"), name="assets")

@app.get("/")
def serve_frontend():
    return FileResponse("../phishguard-ai/dist/index.html")

@app.get("/favicon.svg")
def favicon():
    return FileResponse("../phishguard-ai/dist/favicon.svg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

