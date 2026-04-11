"""Export Qwen2 to ONNX using optimum."""

from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from optimum.onnxruntime import ORTModelForCausalLM

MODEL_PATH = Path("models")
OUTPUT_PATH = Path("models/qwen2_onnx")

print(f"Loading model from {MODEL_PATH}...")

tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH), trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(str(MODEL_PATH), trust_remote_code=True)

print("Converting to ONNX...")
exported_model = ORTModelForCausalLM.from_pretrained(
    str(MODEL_PATH),
    export=True,
    opset=18,
)

print(f"Saving to {OUTPUT_PATH}...")
exported_model.save_pretrained(str(OUTPUT_PATH))
tokenizer.save_pretrained(str(OUTPUT_PATH))

print("Done! ONNX model saved.")
