export const matches = [
    {"sport":"Soccer", "competition": "English Premier League", "home":"Liverpool", "away":"Man Utd", "market":"Asian Handicap", "runner":"Man Utd +0.5", "strategy":{"name":"soccer_3","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 10,
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
            'side': 'LAY',
            'time_to': 45,
            'scale': 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "Spanish La Liga", "home":"Real Sociedad", "away":"Betis", "market":"Asian Handicap", "runner":"Betis +0.5", "strategy":{"name":"soccer_3","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 10,
            'price': 2.3
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
            'side': 'LAY',
            'time_to': 45,
            'scale': 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "English Premier League", "home":"Brentford", "away":"Aston Villa", "market":"Asian Handicap", "runner":"Aston Villa +0.5", "strategy":{"name":"soccer_2","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            'time_to': 60,
            'handicap': 0.5
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0,
            "time_to": 85
        }
    }}},
    {"sport":"Soccer", "competition": "Italian Serie A", "home":"Lazio", "away":"Inter", "market":"Asian Handicap", "runner":"Lazio +0.5", "strategy":{"name":"soccer_3","params": {
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
            'side': 'LAY',
            'time_to': 45,
            'scale': 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "German Bundesliga", "home":"Leverkusen", "away":"Eintracht Frankfurt", "market":"Asian Handicap", "runner":"Eintracht Frankfurt +0.5", "strategy":{"name":"soccer_2","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            'time_to': 60,
            'handicap': 0.5
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0,
            "time_to": 85
        }
    }}},
    {"sport":"Soccer", "competition": "German Bundesliga", "home":"Bayern Munich", "away":"Stuttgart", "market":"Asian Handicap", "runner":"Stuttgart +0.5", "strategy":{"name":"soccer_1","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            'time_to': 60
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0,
            "time_to": 85
        }
    }}},
]


