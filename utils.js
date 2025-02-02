// emailTasks.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent'); // 使用解构导入
const proxyUrl = 'socks5h://127.0.0.1:1080';
const proxyAgent = new SocksProxyAgent(proxyUrl);

function getHandicap(runner, home, away) {
  let handicap = ''
  if (runner.includes(home))
    handicap = runner.replace(home, '').trim()
  else
    handicap = runner.replace(away, '').trim()
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
  let oth_runner = runner;
  if (oth_runner.includes(home)) {
    oth_runner = runner.replace(home, away)
  } else if (oth_runner.includes(away)) {
    oth_runner = runner.replace(away, home)
  }
  if (oth_runner.includes('+')) {
    oth_runner = oth_runner.replace(/\+(\d)/g, '-$1')
  } else if (oth_runner.includes('-')) {
    oth_runner = oth_runner.replace(/-(\d)/g, '+$1')
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

function isSubsequence(str, subseq) {
  let j = 0; // subseq 的索引

  // 遍历 str 的每个字符
  for (let i = 0; i < str.length && j < subseq.length; i++) {
    if (str[i] === subseq[j]) {
      j++; // 当字符匹配时，移动 subseq 的索引
    }
  }

  // 如果 subseq 的所有字符都被找到，返回 true
  return j === subseq.length;
}

function getSimilar(shorten, base, ...args) {
  // 将基准参数根据非字母数字字符拆分成数组
  const baseElements = base.split(/[^a-zA-Z0-9]/).filter(Boolean);
  let shouldReturnZero = false;

  // 对每个参数进行同样的处理，并比较
  const totalIncluded = args.reduce((totalIncluded, arg) => {
    // 将当前参数拆分成元素
    const argElements = arg.split(/[^a-zA-Z0-9]/).filter(Boolean);

    // 计算当前参数中有多少元素被基准参数包含
    const includedCount = argElements.reduce((count, elem) => {
      if (shorten)
        return count + (baseElements.some(baseElem => (baseElem.length > 1 && elem.length > 1) && (isSubsequence(baseElem, elem) || isSubsequence(elem, baseElem))) ? 1 : 0);
      else
        return count + (baseElements.some(baseElem => (baseElem.length > 1 && elem.length > 1) && (baseElem.includes(elem) || elem.includes(baseElem))) ? 1 : 0);
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
      let sim = getSimilar(false, bet.competition, compet.Cnm.substring(0, 2), compet.Snm)
      if (sim > 0) {
        competition.push(compet)
      }
    })

    if (!competition.length)
      competition = competitions

    if (competition.length) {
      for (let compet of competition) {
        for (let e of compet.Events) {
          let sim_home = e.T1.length == 1 ? getSimilar(false, bet.home, e.T1[0].Nm) : 0
          let sim_away = e.T2.length == 1 ? getSimilar(false, bet.away, e.T2[0].Nm) : 0
          if (sim_home > 0 && sim_away > 0) {
            return e
          }
        }
      }
    }

    if (competition.length) {
      for (let compet of competition) {
        for (let e of compet.Events) {
          let sim_home = e.T1.length == 1 ? getSimilar(true, bet.home, e.T1[0].Nm) : 0
          let sim_away = e.T2.length == 1 ? getSimilar(true, bet.away, e.T2[0].Nm) : 0
          if (sim_home > 0 && sim_away > 0) {
            return e
          }
        }
      }
    }

    return null
  }
}

function checkBets(params) {
  let currentBets = params.bet.currentBets.filter(item => Number(item.sizeRemaining) == 0.0)
  let invalidBets = params.bet.currentBets.filter(item => Number(item.sizeLapsed) > 0.0 || Number(item.sizeVoided) > 0.0 || Number(item.sizeCancelled) > 0.0)
  if (!params.bet.pre.hasOwnProperty('num_bets') || params.bet.pre.num_bets <= params.bet.currentBets.length)
    params.bet.pre.num_bets = currentBets.length
  else if ((params.bet.pre.num_bets > params.bet.currentBets.length && (/^\d/.test(params.event.timeElapsed) || /\d$/.test(params.event.timeElapsed))) || invalidBets.length) {
    params.bet.pre.num_bets = 0
    global.reset = true
    return false
  }
  else 
    return false

  params.event.runner_win = 0.0
  params.event.oth_win = 0.0

  if (currentBets.length) {
    let last_bet = currentBets[currentBets.length - 1]

    if (last_bet.selectionId == params.bet.selectionId) {
      params.event.runner_thresh_odds = last_bet.averagePrice
      params.event.oth_thresh_odds = 1.0 / (last_bet.averagePrice - 1.0) + 1.0
      params.event.runner_handicap = Number(last_bet.handicap)
      params.event.oth_handicap = -Number(last_bet.handicap)
      params.event.lastIsRunner = last_bet.side == 'BACK' ? true : false
    }
    else {
      params.event.oth_thresh_odds = last_bet.averagePrice
      params.event.runner_thresh_odds = 1.0 / (last_bet.averagePrice - 1.0) + 1.0
      params.event.oth_handicap = Number(last_bet.handicap)
      params.event.runner_handicap = -Number(last_bet.handicap)
      params.event.lastIsRunner = last_bet.side == 'BACK' ? false : true
    }

    for (let b of currentBets) {
      if (b.selectionId == params.bet.selectionId) {
        if (b.side == 'BACK') {
          params.event.runner_win += Number(b.profitNet)
          params.event.oth_win -= Number(b.liability)
        } else {
          params.event.runner_win -= Number(b.liability)
          params.event.oth_win += Number(b.profitNet)
        }
      } else {
        if (b.side == 'BACK') {
          params.event.oth_win += Number(b.profitNet)
          params.event.runner_win -= Number(b.liability)
        } else {
          params.event.oth_win -= Number(b.liability)
          params.event.runner_win += Number(b.profitNet)
        }
      }
    }
  }

  params.event.runner_side = params.event.lastIsRunner ? 'BACK' : 'LAY'

  if ((params.event.runner_win < -params.bet.vol || params.event.oth_win < -params.bet.vol) && currentBets.length > 1)
    return false

  return true
}

async function assertBet(currentBet, selectionId, params, condition) {
  let res = true
  // if (currentBet) {
  //   if (currentBet.selectionId == selectionId && params.bet.strategy.params[condition].side == currentBet.side)
  //     res = false
  //   else if (currentBet.selectionId != selectionId && params.bet.strategy.params[condition].side != currentBet.side)
  //     res = false

  //   if (!res) {
  //     let _params = JSON.stringify(params);
  //     let _selectionId = selectionId.toString();
  //     try {
  //       const response = await sendEmail({
  //         subject: 'Bets Confict',
  //         html: `<p>${_selectionId}</p><p>${_params}</p>`
  //       });
  //       console.log(response);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // }


  // if (res) {
  //   if (params.bet.strategy.params[condition].side == 'BACK') {
  //     if (!((params.event.oth_back_odds > 1.01 && params.event.oth_back_odds < 99) && (params.event.back_odds > 1.01 && params.event.back_odds < 99)))
  //       res = false
  //   }
  //   else if (params.bet.strategy.params[condition].side == 'LAY') {
  //     if (!((params.event.oth_lay_odds > 1.01 && params.event.oth_lay_odds < 99) && (params.event.lay_odds > 1.01 && params.event.lay_odds < 99)))
  //       res = false
  //   }

  //   if (!res) {
  //     let _params = JSON.stringify(params)
  //     try {
  //       const response = await sendEmail({
  //         subject: 'Odds Confict',
  //         html: `<p>${_params}</p>`
  //       });
  //       console.log(response);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // }

  return res
}

async function fetchData(url) {
  const response = await axios.get(url, { timeout: 20000, httpAgent: proxyAgent, httpsAgent: proxyAgent });
  return response.data; // 直接返回解析后的 JSON 数据
}

function parseBet(event) {
  let jsonArray = []
  if (event.payload && event.payload.includes('offerId')) {
    const trimmedPayload = event.payload.substr(2, event.payload.length - 3);
    const jsonArrayString = JSON.parse(trimmedPayload);
    jsonArray = JSON.parse(jsonArrayString)
    if (event.payload.includes('CURRENT_BETS'))
      jsonArray = JSON.parse(jsonArrayString).CURRENT_BETS;
  }
  return jsonArray
}


async function sendEmail({ subject, text, html }) {
  const json = JSON.parse(await fs.readFile('./data/profile.json', 'utf8'));

  const transporter = nodemailer.createTransport({
    service: '163',
    auth: {
      user: json['mailadress'],
      pass: json['mailpass']
    }
  });

  let mailOptions = {
    from: 'psnewer@163.com',
    to: '969941416@qq.com',
    subject: subject,
    text: text,
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info.response;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}

module.exports = { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets, getSimilar };
