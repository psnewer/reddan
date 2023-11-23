export const matches = [
    {"sport":"Tennis", "competition": "Davis Cup 2023", "home":"Matteo Arnaldi", "away":"Botic Van de Zandschulp", "market":"Match Odds", "runner":"Botic Van de Zandschulp", "strategy":{"name":"tennis_2","params": {
        "eitherLose": {
            "set": 1,
            "side": "BACK",
            "vol": 6,
            "delta": 6
        },
        "loseWin": {
            "loseset": 1,
            "winset": 2,
            "side": "BACK",
            "scale": 1.0,
            "oth": true
        }
    }}},
    {"sport":"Tennis", "competition": "Davis Cup 2023", "home":"Jannik Sinner", "away":"Tallon Griekspoor", "market":"Match Odds", "runner":"Jannik Sinner", "strategy":{"name":"tennis_1","params":{
        'loseSet': {
            'set': 1,
            'side': 'BACK',
            'vol': 6,
            'delta': 3
        },
        'winSet': {
            'set': 2,
            'oth': true,
            'side': 'BACK',
            'scale': 1.0
        }
    }}},
]


