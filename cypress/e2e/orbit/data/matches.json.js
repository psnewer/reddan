export const matches = [
    {"sport":"Tennis", "competition": "ATP Marseille", "home":"Hugo Gaston", "away":"Denis Shapovalov", "market":"Match Odds", "runner":"Denis Shapovalov", "strategy":{"name":"tennis_1","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            "delta": 2,
            "set": 1
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Dallas", "home":"Emilio Nava", "away":"Michael Mmoh", "market":"Match Odds", "runner":"Emilio Nava", "strategy":{"name":"tennis_1","params": {
        "notMatchOne": {
            "side": "BACK",
            "vol": 10,
            "delta": 2,
            "set": 1
        },
        "notMatchTwo": {
            "side": "BACK",
            "scale": 1.0
        }
    }}},
    {"sport":"Tennis", "competition": "ATP Marseille", "home":"Zhizhen Zhang", "away":"Alexandre Muller", "market":"Match Odds", "runner":"Alexandre Muller", "strategy":{"name":"tennis_3","params": {
        "notInPlay": {
            "side": "BACK",
            "vol": 10,
            "guarantee": 0.96
          },
          "notMatchOne": {
              "side": "BACK",
              "vol": 10,
              "guarantee": 0.9
          },
          "notMatchTwo": {
              "side": "LAY",
              "scale": 1,
              "rec": 0.3
          }
    }}},
    {"sport":"Tennis", "competition": "ATP Cordoba Open", "home":"Mariano Navone", "away":"Roberto Carballes Baena", "market":"Match Odds", "runner":"Roberto Carballes Baena", "strategy":{"name":"tennis_3","params": {
        "notInPlay": {
            "side": "BACK",
            "vol": 10,
            "guarantee": 0.96
          },
          "notMatchOne": {
              "side": "BACK",
              "vol": 10,
              "guarantee": 0.9
          },
          "notMatchTwo": {
              "side": "LAY",
              "scale": 1,
              "rec": 0.3
          }
    }}},
]


