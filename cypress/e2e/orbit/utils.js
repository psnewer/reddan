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

  export default {getHandicap, hasNestedProperty}