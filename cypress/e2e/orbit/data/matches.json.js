export const matches = [
    {"sport":"Soccer", "competition": "English Premier League", "home":"Man City", "away":"Liverpool", "market":"Asian Handicap", "runner":"Liverpool +0.5", "strategy":{"name":"soccer_1","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 6,
            'price': 2.3
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 6,
            'cut_time' :5
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
        },
        'notPlaceTwo': {
            'oth': true,
            'side': 'BACK',
            'profit': 0.5,
            'scale': 1.0
        }
    }}},
    {"sport":"Soccer", "competition": "German Bundesliga", "home":"Werder Bremen", "away":"Leverkusen", "market":"Asian Handicap", "runner":"Werder Bremen +0.5", "strategy":{"name":"soccer_1","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 6,
            'price': 3.05
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 6,
            'cut_time' :5
        },
        'isRunnerAdvance': {
            'side': 'LAY',
            'scale': 1.0
        },
        'timeElapseTo': {
            'oth': true,
            'time_to': 45,
            'side': 'BACK',
            'scale': 1.0
        },
        'notPlaceTwo': {
            'oth': true,
            'side': 'BACK',
            'profit': 0.3,
            'scale': 1.0
        }
    }}}
]


