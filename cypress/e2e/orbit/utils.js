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

export default {getHandicap, getOth}