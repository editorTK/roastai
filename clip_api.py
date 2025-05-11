
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import io
import os

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:9002",  # Allow your Next.js dev server
    # Add other origins if needed, e.g., your production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the CLIP model and processor
# It's good practice to load models once at startup
try:
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    # Move model to GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
except Exception as e:
    print(f"Error loading CLIP model: {e}")
    # You might want to handle this more gracefully, e.g., by disabling the endpoint
    # or returning a specific error if the model can't be loaded.
    # For now, the app will fail to start or requests will fail if model is None.
    processor = None
    model = None


@app.post("/analyze")
async def analyze(image: UploadFile = File(...), language: str = Form("en")):
    if not model or not processor:
        raise HTTPException(status_code=503, detail="CLIP model is not available.")

    try:
        image_data = await image.read()
        img_pil = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Texts for CLIP, localized
    if language == "es":
        texts = ["un selfie genérico", "alguien intentando parecer guay", "una persona posando con un sentido de la moda cuestionable", "un intento de ser influencer", "una instantánea de baja calidad", "una foto de perfil", "alguien en la naturaleza", "una mascota adorable", "comida deliciosa", "un meme"]
        base_prompt_template = "La imagen parece ser de {analyzed_keywords}. Basándonos en esto, el sujeto podría ser un poco predecible o estar esforzándose demasiado."
    else:  # Default to English
        texts = ["a generic selfie", "someone trying to look cool", "a person posing with questionable fashion sense", "an attempt at being an influencer", "a low-quality snapshot", "a profile picture", "someone in nature", "an adorable pet", "delicious food", "a meme"]
        base_prompt_template = "The image appears to be of {analyzed_keywords}. Based on this, the subject might be a bit predictable or trying too hard."

    try:
        inputs = processor(text=texts, images=img_pil, return_tensors="pt", padding=True).to(device)
        with torch.no_grad(): # Disable gradient calculations for inference
            outputs = model(**inputs)
        
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        best_match_index = probs.argmax().item() # Use .item() to get Python number
        best_match_description = texts[best_match_index]
        
        roast_detail = base_prompt_template.format(analyzed_keywords=best_match_description)

        return {"roast_prompt": roast_detail}
    except Exception as e:
        print(f"Error during CLIP processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image with CLIP: {e}")

@app.get("/")
async def root():
    return {"message": "CLIP API is running. Use the /analyze endpoint to process images."}

if __name__ == "__main__":
    import uvicorn
    # Read port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

