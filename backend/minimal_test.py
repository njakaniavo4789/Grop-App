"""Minimal test Qwen2 -tres rapide"""

from chat.pipeline.llm import load_qwen2_model, call_qwen2

print("Loading...")
t, m = load_qwen2_model()
print("OK!")

r = call_qwen2("Riz")
print(f"In: {r['input_tokens']} Out: {r['output_tokens']} Time: {r['latency_ms']}ms")
print(r["reply"][:200])
print("Done!")
