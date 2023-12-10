export const matches = [
    {"sport":"Soccer", "competition": "Spanish La Liga", "home":"Granada", "away":"Athletic Bilbao", "market":"Asian Handicap", "runner":"Athletic Bilbao 0", "strategy":{"name":"soccer_1","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            'time_to': 60,
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "English Premier League", "home":"Tottenham", "away":"Newcastle", "market":"Asian Handicap", "runner":"Newcastle +0.5", "strategy":{"name":"soccer_3","params": {
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
            'side': 'BACK',
            'time_to': 65,
            'scale': 1.0
        },
        'timeElapseTo': {
            'side': 'LAY',
            'time_to': 45,
            'scale': 1.0
        }
    }}},
]


