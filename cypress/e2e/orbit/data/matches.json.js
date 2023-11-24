export const matches = [
    {"sport":"Soccer", "sub":"Belgium", "competition": "Belgian First Division A", "home":"Sint Truiden", "away":"Antwerp", "market":"Asian Handicap", "runner":"Sint Truiden +0.5", "strategy":{"name":"soccer_1","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 6,
            'price': 2.1
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 6,
            'cut_time' :5
        },
        'notPlaceTwo': {
            'oth': true,
            'side': 'BACK',
            'profit': 0.3,
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
    }}},
    {"sport":"Soccer", "sub":"Japan", "competition": "Japanese J League", "home":"Kawasaki", "away":"Kashima", "market":"Asian Handicap", "runner":"Kashima +0.5", "strategy":{"name":"soccer_1","params": {
        'notInPlay': {
            'side': 'BACK',
            'vol': 6,
            'price': 1.9
        },
        'notMatchOne': {
            'side': 'BACK',
            'vol': 6,
            'cut_time' :5
        },
        'notPlaceTwo': {
            'oth': true,
            'side': 'BACK',
            'profit': 0.3,
            'scale': 1.0
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
        }
    }}}
]


