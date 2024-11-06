import { getSimilar } from '../../../utils.js'

function getHandicap(runner,home,away) {
    let handicap = ''
    if (runner.includes(home))
      handicap = runner.replace(home,'').trim()
    else
      handicap = runner.replace(away,'').trim()
    if (handicap.includes('+'))
      handicap = handicap.replace('+', '').trim() 
    if (!handicap.length)
      handicap = '0'
    return handicap
  }

function getOth(home, away, runner) {
    let oth_runner =  runner;
    if (oth_runner.includes(home)) {
      oth_runner = runner.replace(home,away)
    }else if(oth_runner.includes(away)){
      oth_runner = runner.replace(away,home)
    }
    if (oth_runner.includes('+')) {
      oth_runner = oth_runner.replace(/\+(\d)/g, '-$1')
    }else if (oth_runner.includes('-')) {
      oth_runner = oth_runner.replace(/-(\d)/g, '+$1')
    }
    return oth_runner;
  }

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

export default {getHandicap, getOth, isCompetition, isTeam}