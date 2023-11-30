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

function hasNestedProperty(obj, ...props) {
    return props.reduce((obj, prop) => {
      return obj && obj.hasOwnProperty(prop) ? obj[prop] : undefined;
    }, obj) !== undefined;
  }

function getOth(home, away, runner) {
    let oth_runner =  runner;
    if (oth_runner.includes(home)) {
      oth_runner = runner.replace(home,away)
    }else if(oth_runner.includes(away)){
      oth_runner = runner.replace(away,home)
    }
    if (oth_runner.includes('+')) {
      oth_runner = oth_runner.replace('+','-')
    }else if (oth_runner.includes('-')) {
      oth_runner = oth_runner.replace('-','+')
    }
    return oth_runner;
  }

function countElementsGE(a, b) {
    let count = 0;
    for (let i = 0; i < a.length; i++) {
        if (Number(a[i]) > Number(b[i])) {
            count++;
        }
    }
    return 2 * count - a.length;
  }

  export default {getHandicap, hasNestedProperty, getOth, countElementsGE}