export const matches = [
    {"sport":"Soccer", "competition": "English Premier League", "home":"Newcastle", "away":"Nottm Forest", "market":"Asian Handicap", "runner":"Nottm Forest +0.5", "strategy":{"name":"soccer_3","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 10
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 10,
            'time_to' :5
        },
        'ending': {
            'time_to': 80,
            'delta': 0,
            'side': 'LAY',
            'scale': 1.0
        },
        'isRunnerAdvance': {
            'side': 'LAY',
            'time_to': 65,
            'scale': 1.0
        },
        'timeElapseTo': {
            'side': 'BACK',
            'time_to': 40,
            'scale': 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "English Premier League", "home":"Man Utd", "away":"Aston Villa", "market":"Asian Handicap", "runner":"Aston Villa +0.5", "strategy":{"name":"soccer_2","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            'time_to': 60,
            'handicap': 0.5
        },
        "notMatchTwo": {
            "side": "LAY",
            "scale": 1.0,
            "time_to": 85
        }
    }}},
]


