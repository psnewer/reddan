export const matches = [
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Arthur Fils", "away":"Luca Nardi", "market":"Match Odds", "runner":"Luca Nardi", "strategy":{"name":"tennis_1","params": {
        'loseSet': {
            'set': 1,
            'side': 'BACK',
            'vol': 6,
            'delta': 2
        },
        'winSet': {
            'set': 2,
            'oth': true,
            'side': 'BACK',
            'scale': 1.0
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Dominic Stricker", "away":"Flavio Cobolli", "market":"Match Odds", "runner":"Flavio Cobolli", "strategy":{"name":"tennis_2","params": {
        "eitherLose": {
            "set": 1,
            "side": "BACK",
            "vol": 6,
            "delta": 2
        },
        "loseWin": {
            "loseset": 1,
            "winset": 2,
            "side": "BACK",
            "scale": 1.0,
            "oth": true
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Luca Van Assche", "away":"Abdullah Shelbayh", "market":"Match Odds", "runner":"Abdullah Shelbayh", "strategy":{"name":"tennis_1","params": {
        'loseSet': {
            'set': 1,
            'side': 'BACK',
            'vol': 6,
            'delta': 2
        },
        'winSet': {
            'set': 2,
            'oth': true,
            'side': 'BACK',
            'scale': 1.0
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Alex Michelsen", "away":"Hamad Medjedovic", "market":"Match Odds", "runner":"Hamad Medjedovic", "strategy":{"name":"tennis_2","params": {
        "eitherLose": {
            "set": 1,
            "side": "BACK",
            "vol": 6,
            "delta": 2
        },
        "loseWin": {
            "loseset": 1,
            "winset": 2,
            "side": "BACK",
            "scale": 1.0,
            "oth": true
        }
    }}},
]


