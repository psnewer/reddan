export const matches = [
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Arthur Fils", "away":"Luca Van Assche", "market":"Match Odds", "runner":"Luca Van Assche", "strategy":{"name":"tennis_2","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 6,
            "price": 2.0,
            "delta": 2
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Next Gen Finals 2023", "home":"Hamad Medjedovic", "away":"Dominic Stricker", "market":"Match Odds", "runner":"Dominic Stricker", "strategy":{"name":"tennis_2","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 6,
            "price": 2.0,
            "delta": 2
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "English Premier League", "home":"Liverpool", "away":"Fulham", "market":"Asian Handicap", "runner":"Fulham +0.5", "strategy":{"name":"soccer_1","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 6,
            'price': 2.5
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 6,
            'cut_time' :5
        },
        'ending': {
            'time_to': 80,
            'delta': 0,
            'side': 'LAY',
            'scale': 1.0
        },
        'isRunnerAdvance': {
            'oth': true,
            'side': 'BACK',
            'scale': 1.0
        },
        'timeElapseTo': {
            'oth': true,
            'time_to': 45,
            'side': 'BACK',
            'scale': 1.0
        }
    }}}
]


