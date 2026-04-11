"""Quick test Qwen2 - sans details memoire"""

from chat.pipeline.llm import load_qwen2_model, call_qwen2

print("Loading model...")
t, m = load_qwen2_model()
print("Model loaded!")

print("\nTest 1: Simple")
r = call_qwen2("Quel engrais pour le riz?")
print(f"  Input: {r['input_tokens']} tokens")
print(f"  Output: {r['output_tokens']} tokens")
print(f"  Latency: {r['latency_ms']}ms")
print(f"  Response: {r['reply'][:150]}...")

print("\nTest 2: Agriculture context")
r = call_qwen2("Comment planter la vanille a Madagascar?")
print(f"  Input: {r['input_tokens']} tokens")
print(f"  Output: {r['output_tokens']} tokens")
print(f"  Latency: {r['latency_ms']}ms")
print(f"  Response: {r['reply'][:150]}...")

print("\nTests termines!")
