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

  function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('');
  }

  function getSimilar(base, ...args) {
    // 将基准参数根据非字母数字字符拆分成数组
    const baseElements = base.split(/[^a-zA-Z0-9]/).filter(Boolean);
    let shouldReturnZero = false;

    // 对每个参数进行同样的处理，并比较
    const totalIncluded = args.reduce((totalIncluded, arg) => {
        // 将当前参数拆分成元素
        const argElements = arg.split(/[^a-zA-Z0-9]/).filter(Boolean);
        
        // 计算当前参数中有多少元素被基准参数包含
        const includedCount = argElements.reduce((count, elem) => {
            return count + (baseElements.some(baseElem => baseElem.includes(elem) || elem.includes(baseElem)) ? 1 : 0);
        }, 0);

        // 如果任何一个参数与基准参数的被包含元素数量为0，则返回0
        if (includedCount === 0) {
          shouldReturnZero = true;
        }

        return totalIncluded + includedCount;
    }, 0);

    return shouldReturnZero ? 0 : totalIncluded;
}

function getEvent(score_sport, bet) {
  if (score_sport.hasOwnProperty('Stages')) {
    let competitions = score_sport['Stages']
    let competition = []
    competitions.forEach(compet => {
        let sim = getSimilar(bet.competition, compet.Cnm.substring(0,2), compet.Snm)
        if (sim > 0) {
            competition.push(compet)
        }
    })

    if (!competition.length)
      competition = competitions

    if (competition.length) {
      for (let compet of competition) {
        for (let e of compet.Events) {
          let sim_home = getSimilar(bet.home, e.T1[0].Nm)
          let sim_away = getSimilar(bet.away, e.T2[0].Nm)
          if (sim_home > 0 && sim_away > 0) {
              return e
          }
        }
      }
    }
    return null
  }
}


export default {getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent}