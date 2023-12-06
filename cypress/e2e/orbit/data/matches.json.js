export const matches = [
    {"sport":"Soccer", "competition": "International", "home":"Wuhan Three Towns", "away":"Pohang Steelers", "market":"Asian Handicap", "runner":"Pohang Steelers +0.5", "strategy":{"name":"soccer_3","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 10,
            'price': 1.5
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
            'scale': 1.0
        },
        'timeElapseTo': {
            'time_to': 45,
            'side': 'LAY',
            'scale': 1.0
        }
    }}}
]


