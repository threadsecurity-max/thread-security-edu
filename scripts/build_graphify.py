import os
import sys
import json
from pathlib import Path

out_dir = Path('graphify-out')
out_dir.mkdir(exist_ok=True)

from graphify.detect import detect
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.viz import generate_html

input_path = Path('.')

print('--- Step 1: Detecting files ---')
detection = detect(input_path)
(out_dir / '.graphify_detect.json').write_text(json.dumps(detection, ensure_ascii=False), encoding='utf-8')
print(f"Detected {detection['total_files']} files")

print('--- Step 2: AST Extraction ---')
code_files = []
for f in detection.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

ast_result = extract(code_files, cache_root=input_path)
(out_dir / '.graphify_ast.json').write_text(json.dumps(ast_result, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"AST: {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges")

print('--- Step 3: Merging ---')
merged = {
    'nodes': ast_result['nodes'],
    'edges': ast_result['edges'],
    'hyperedges': [],
    'input_tokens': 0,
    'output_tokens': 0
}
(out_dir / '.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')

print('--- Step 4: Building & Clustering Knowledge Graph ---')
G = build_from_json(merged, root=str(input_path.resolve()), directed=False)
communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
questions = suggest_questions(G, communities)

report_md = generate(G, communities, cohesion, gods, surprises, questions, detection, {'input': 0, 'output': 0})
(out_dir / 'GRAPH_REPORT.md').write_text(report_md, encoding='utf-8')
(out_dir / 'graph.json').write_text(to_json(G, communities), encoding='utf-8')

print('--- Step 5: Generating Interactive HTML Visualization ---')
html_str = generate_html(G, communities)
(out_dir / 'graph.html').write_text(html_str, encoding='utf-8')

print('--- GRAPHIFY GENERATION COMPLETE ---')
print(f"Total Nodes: {G.number_of_nodes()}")
print(f"Total Edges: {G.number_of_edges()}")
print(f"Detected Communities: {len(communities)}")
print(f"Interactive Graph: file:///{Path('graphify-out/graph.html').resolve().as_posix()}")
print(f"Graph Report: file:///{Path('graphify-out/GRAPH_REPORT.md').resolve().as_posix()}")
