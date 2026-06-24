import json
import random

poets = json.load(open('data/poets.json'))
relations = json.load(open('data/relations.json'))

existing_rels = set()
for r in relations:
    existing_rels.add((r['from'], r['to']))
    existing_rels.add((r['to'], r['from']))

dynasty_groups = {}
for p in poets:
    dynasty_groups.setdefault(p['dynasty'], []).append(p['id'])

new_relations = list(relations)

# ensure everyone has at least 1-2 intra-dynasty connections
for p in poets:
    pid = p['id']
    group = dynasty_groups[p['dynasty']]
    
    # count how many connections they currently have
    count = sum(1 for (a,b) in existing_rels if a == pid or b == pid)
    
    # If they have < 2 connections, add some random ones from their dynasty
    attempts = 0
    while count < 2 and attempts < 10:
        attempts += 1
        other = random.choice(group)
        if other != pid and (pid, other) not in existing_rels:
            new_relations.append({
                "from": pid,
                "to": other,
                "type": "齐名",
                "note": "同时期诗人交往"
            })
            existing_rels.add((pid, other))
            existing_rels.add((other, pid))
            count += 1

with open('data/relations.json', 'w', encoding='utf-8') as f:
    json.dump(new_relations, f, ensure_ascii=False, indent=2)

print(f"Total relations now: {len(new_relations)}")
