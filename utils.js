// emailTasks.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const axios = require('axios');

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
        return count + (baseElements.some(baseElem => isSubsequence(baseElem, elem) || isSubsequence(elem, baseElem)) ? 1 : 0);
      else
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
          let sim_home = getSimilar(false, bet.home, e.T1[0].Nm)
          let sim_away = getSimilar(false, bet.away, e.T2[0].Nm)
          if (sim_home > 0 && sim_away > 0) {
            return e
          }
        }
      }
    }

    if (competition.length) {
      for (let compet of competition) {
        for (let e of compet.Events) {
          let sim_home = getSimilar(true, bet.home, e.T1[0].Nm)
          let sim_away = getSimilar(true, bet.away, e.T2[0].Nm)
          if (sim_home > 0 && sim_away > 0) {
            return e
          }
        }
      }
    }

    return null
  }
}

async function assertBet(currentBet, selectionId, params, condition) {
  let res = true
  if (currentBet) {
    if (currentBet.selectionId == selectionId && params.bet.strategy.params[condition].side == currentBet.side)
      res = false
    else if (currentBet.selectionId != selectionId && params.bet.strategy.params[condition].side != currentBet.side)
      res = false

    if (!res) {
      let _params = JSON.stringify(params);
      let _selectionId = selectionId.toString();
      try {
        const response = await sendEmail({
          subject: 'Bets Confict',
          html: `<p>${_selectionId}</p><p>${_params}</p>`
        });
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
  }


  if (params.bet.sport === "Basketball" || condition === 'notInPlay') {
    if (params.bet.strategy.params[condition].side == 'BACK') {
      if (!((params.event.oth_back_odds > 1.03 && params.event.oth_back_odds < 50) && (params.event.back_odds > 1.03 && params.event.back_odds < 50)))
        res = false
    }
    else if (params.bet.strategy.params[condition].side == 'LAY') {
      if (!((params.event.oth_lay_odds > 1.03 && params.event.oth_lay_odds < 50) && (params.event.lay_odds > 1.03 && params.event.lay_odds < 50)))
        res = false
    }

    if (!res) {
      let _params = JSON.stringify(params)
      try {
        const response = await sendEmail({
          subject: 'Odds Confict',
          html: `<p>${_params}</p>`
        });
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
  }

  return res
}

async function fetchData(url) {
  const response = await axios.get(url, { timeout: 20000 });
  return response.data; // 直接返回解析后的 JSON 数据
}

function parseBet(event) {
  let jsonArray = []
  if (event.payload && event.payload.includes('offerId')) {
    const trimmedPayload = event.payload.substr(2, event.payload.length - 3);
    const jsonArrayString = JSON.parse(trimmedPayload);
    jsonArray = JSON.parse(jsonArrayString);
  }
  return jsonArray
}


async function sendEmail({ subject, text, html }) {
  const json = JSON.parse(await fs.readFile('cypress/e2e/orbit/data/profile.json', 'utf8'));

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

module.exports = { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail };