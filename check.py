import json
import argparse
import os

def load_json_file(file_path):
    """加载JSON文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(data, file_path):
    """保存JSON文件"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ================== 第一个功能：过滤JSON字段 ==================
def should_keep(value, keys_to_keep):
    """检查该值或其嵌套结构中是否有需要保留的键"""
    if isinstance(value, dict):
        for k, v in value.items():
            if k in keys_to_keep:
                return True
            if should_keep(v, keys_to_keep):
                return True
        return False
    elif isinstance(value, list):
        for item in value:
            if should_keep(item, keys_to_keep):
                return True
        return False
    return False

def filter_dict_by_keys(original_dict, keys_to_keep):
    """递归过滤字典，只保留能到达keys_to_keep的路径上的键"""
    if not isinstance(original_dict, dict):
        return original_dict

    filtered_dict = {}
    for key, value in original_dict.items():
        if key in keys_to_keep:
            filtered_dict[key] = value
        elif isinstance(value, dict):
            filtered_value = filter_dict_by_keys(value, keys_to_keep)
            if filtered_value:
                filtered_dict[key] = filtered_value
        elif isinstance(value, list):
            filtered_list = []
            for item in value:
                if isinstance(item, dict):
                    filtered_item = filter_dict_by_keys(item, keys_to_keep)
                    if filtered_item:
                        filtered_list.append(filtered_item)
            if filtered_list:
                filtered_dict[key] = filtered_list
    return filtered_dict if filtered_dict else None

def filter_json(input_file, output_file, keys_to_keep):
    """过滤JSON文件，保留指定字段"""
    try:
        data = load_json_file(input_file)
        if not isinstance(data, list):
            raise ValueError("输入文件应该包含一个字典数组")
        
        processed_data = []
        for item in data:
            if isinstance(item, dict):
                filtered_item = filter_dict_by_keys(item, keys_to_keep)
                if filtered_item:
                    processed_data.append(filtered_item)
        
        save_json_file(processed_data, output_file)
        print(f"过滤完成，结果已保存到 {output_file}")
    except Exception as e:
        print(f"处理过程中发生错误: {str(e)}")

# ================== 第二个功能：智能更新JSON ==================
def find_params_by_name(matches_data, name):
    """在matches_back.json中查找对应name的params"""
    for item in matches_data:
        if item.get('name') == name:
            return item.get('params', {})
    return {}

def update_dict_partial(old_dict, new_dict):
    """递归更新字典，只覆盖new_dict中存在的字段"""
    if not isinstance(old_dict, dict) or not isinstance(new_dict, dict):
        return new_dict
    
    for key, new_value in new_dict.items():
        if key in old_dict:
            if isinstance(old_dict[key], dict) and isinstance(new_value, dict) and key != 'drawSets' and key != 'eitherDraw':
                update_dict_partial(old_dict[key], new_value)
            else:
                old_dict[key] = new_value
        else:
            old_dict[key] = new_value
    return old_dict

def update_json(old_file, new_file, matches_file):
    """智能更新JSON文件，要求home和away同时匹配"""
    # try:
    old_data = load_json_file(old_file)
    new_data = load_json_file(new_file)
    matches_data = load_json_file(matches_file)
    
    # 遍历旧数据并更新
    updated_old_data = []
    for old_item in old_data:
        old_home = old_item.get('home')
        old_away = old_item.get('away')
        
        # 使用filter查找完全匹配的new_item
        matched_new_items = list(filter(
            lambda x: x.get('home') == old_home and x.get('away') == old_away,
            new_data
        ))
        
        if matched_new_items:
            # 取第一个匹配项（假设唯一）
            new_item = matched_new_items[0]
            
            # 处理strategy
            if 'strategy' in new_item and 'strategy' in old_item:
                new_strategy = new_item['strategy']
                old_strategy = old_item['strategy']
                if new_strategy.get('name') != old_strategy.get('name'):
                    old_strategy['name'] = new_strategy['name']
                    old_strategy['params'] = find_params_by_name(matches_data, new_strategy['name'])
                elif 'params' in new_strategy and 'params' in old_strategy:
                    update_dict_partial(old_strategy['params'], new_strategy['params'])
            
            # 处理runner相关字段
            if 'runner' in new_item and 'runner' in old_item:
                if new_item['runner'] != old_item['runner']:
                    old_runner = old_item['runner']
                    old_item['runner'] = old_item['oth_runner']
                    old_item['oth_runner'] = old_runner
                    
                    if 'selectionId' in old_item and 'oth_selectionId' in old_item:
                        old_selectionId = old_item['selectionId']
                        old_item['selectionId'] = old_item['oth_selectionId']
                        old_item['oth_selectionId'] = old_selectionId
            
            # 更新其他字段
            for key in new_item:
                if key not in ['strategy', 'runner', 'oth_runner', 'selectionId', 'oth_selectionId']:
                    if key in old_item:
                        if isinstance(old_item[key], dict) and isinstance(new_item[key], dict):
                            update_dict_partial(old_item[key], new_item[key])
                        else:
                            old_item[key] = new_item[key]
                    else:
                        old_item[key] = new_item[key]
            
            updated_old_data.append(old_item)
        else:
            # 没有匹配的新数据，跳过不保留
            print(f"警告: 未找到完全匹配项 home={old_home}, away={old_away}，已跳过")
    
    save_json_file(updated_old_data, old_file)
    print(f"更新完成，结果已保存回 {old_file}。共处理 {len(updated_old_data)} 条记录")
    # except Exception as e:
    #     print(f"处理过程中发生错误: {str(e)}")

# ================== 主程序 ==================
if __name__ == "__main__":
    # 设置默认文件路径
    DEFAULT_INPUT = "./cypress/e2e/orbit/data/bets.json"
    DEFAULT_OUTPUT = "./cypress/e2e/orbit/data/cands.json"
    DEFAULT_OLD = "./cypress/e2e/orbit/data/bets.json"
    DEFAULT_NEW = "./cypress/e2e/orbit/data/cands.json"
    DEFAULT_MATCHES = "./cypress/e2e/orbit/data/matches.back.json"
    DEFAULT_KEYS = ["home", "away", "runner", "anchor", "name", "first_runner", "first_oth", "eitherDraw", "drawSets", 'breakdown3', 'drawGames3', "dash"]

    parser = argparse.ArgumentParser(description="JSON处理工具")
    subparsers = parser.add_subparsers(dest='command', help='子命令', required=True)
    
    # 过滤命令
    filter_parser = subparsers.add_parser('filter', help='过滤JSON字段')
    filter_parser.add_argument('-i', '--input', 
                             default=DEFAULT_INPUT,
                             help=f'输入JSON文件 (默认: {DEFAULT_INPUT})')
    filter_parser.add_argument('-o', '--output', 
                             default=DEFAULT_OUTPUT,
                             help=f'输出JSON文件 (默认: {DEFAULT_OUTPUT})')
    filter_parser.add_argument('-k', '--keys', 
                             nargs='+', 
                             default=DEFAULT_KEYS,
                             help=f'要保留的字段列表 (默认: {DEFAULT_KEYS})')
    
    # 更新命令
    update_parser = subparsers.add_parser('update', help='智能更新JSON')
    update_parser.add_argument('-o', '--old', 
                             default=DEFAULT_OLD,
                             help=f'原始JSON文件(将被修改) (默认: {DEFAULT_OLD})')
    update_parser.add_argument('-n', '--new', 
                             default=DEFAULT_NEW,
                             help=f'新JSON文件 (默认: {DEFAULT_NEW})')
    update_parser.add_argument('-m', '--matches', 
                             default=DEFAULT_MATCHES,
                             help=f'matches_back.json文件 (默认: {DEFAULT_MATCHES})')
    
    args = parser.parse_args()
    
    # 检查文件是否存在
    if args.command == 'filter':
        if not os.path.exists(args.input):
            print(f"错误: 输入文件 {args.input} 不存在")
            exit(1)
        filter_json(args.input, args.output, args.keys)
    elif args.command == 'update':
        for f in [args.old, args.new, args.matches]:
            if not os.path.exists(f):
                print(f"错误: 文件 {f} 不存在")
                exit(1)
        update_json(args.old, args.new, args.matches)