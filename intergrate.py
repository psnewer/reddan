import json
from collections import Counter

# 读取 j1 和 j2 文件
with open('cypress/e2e/orbit/data/cands.json', 'r') as f1, open('cypress/e2e/orbit/data/bets.json', 'r') as f2:
    j1 = json.load(f1)
    j2 = json.load(f2)

# 统计 j1 中每个 (home, away) 组合出现的次数
home_away_counts = Counter((item["home"], item["away"]) for item in j1)

# 仅保留 j1 中那些 (home, away) 相等且 selectionId 相等的项
processed_pairs = set()  # 用于跟踪已经处理过的 (home, away) 对

filtered_j1 = j1
# for item in j1:
#     pair = (item["home"], item["away"])

#     # 如果当前 (home, away) 对已经处理过，跳过
#     if pair in processed_pairs:
#         continue

#     # 处理逻辑：当 home_away_counts 为 1 或匹配的第一个 selectionId 相同时添加
#     if home_away_counts[pair] == 1 or (
#         (first_item := next(
#             (other_item for other_item in j1 if other_item["home"] == item["home"] and other_item["away"] == item["away"]),
#             None
#         )) is not None and first_item["selectionId"] == item["selectionId"]
#     ):
#         filtered_j1.append(item)
#         processed_pairs.add(pair)  # 标记为已处理

# 将 j2 转换为字典形式，以便查找和替换
j2_dict = {(item["home"], item["away"]): item for item in j2}

# 替换：如果 j2 中存在相同的 home, away 值，则替换 j1 中的字典
for i, item in enumerate(filtered_j1):
    home_away_pair = (item["home"], item["away"])
    if home_away_pair in j2_dict:
        filtered_j1[i] = j2_dict[home_away_pair]  # 用 j2 中的字典替换 j1 中的

# 将结果保存回 j1 文件
with open('cypress/e2e/orbit/data/bets.json', 'w') as f2:
    json.dump(filtered_j1, f2, indent=4)

print("Intergrate Completed")

