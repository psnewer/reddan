import { getSimilar } from '../../../utils.js'

function isCompetition(cand, competition) {

    let sim_1 = getSimilar(false, competition, cand)
    let sim_2 = getSimilar(true, competition, cand)
    if (sim_1 > 0 || sim_2 > 1) 
        return true
  
    return false
  }
  
function isTeam(c_home, c_away, home, away) {
  
    let sim_home = getSimilar(false, home, c_home)
    let sim_away = getSimilar(false, away, c_away)
    if (sim_home > 0 && sim_away > 0) 
        return true
  
    sim_home = getSimilar(true, home, c_home)
    sim_away = getSimilar(true, away, c_away)
    if (sim_home > 0 && sim_away > 0) 
        return true
  
      return false
  }

export default {isCompetition, isTeam}