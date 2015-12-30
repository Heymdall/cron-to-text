import parseCron from './parseCron';

const LOCALE = {
  ORDINALS: {
    th: 'th',
    st: 'st',
    nd: 'nd',
    rd: 'rd'
  },
  MONTH: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ],
  DOW: [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ],
  'Every': 'Every', // start of expression
  'and': 'and', // 1, 2, 3 and 15th
  'every day': 'every day',
  'minute past the': 'minute past the',
  'hour': 'hour',
  'minute': 'minute',
  'minute of': 'minute of',
  'minute every hour': 'minute every hour',
  'on the': 'on the',
  'of every month': 'of every month',
  'and every': 'and every',
  'on': 'on', // on sun, mon
  'in': 'in' // in jan, apr
};

/**
 * Given a cronspec, return the human-readable string.
 * @param {string} cronspec
 * @param sixth
 * @param {Object=} locale
 */
function cronToText(cronspec, sixth, locale = LOCALE) {
  var schedule = parseCron(cronspec, sixth);

  function absFloor(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }

  function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion,
      value = 0;

    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      value = absFloor(coercedNumber);
    }

    return value;
  }

  function ordinal(number) {
    var b = number % 10,
      output = (toInt(number % 100 / 10) === 1) ? locale.ORDINALS.th :
        (b === 1) ? locale.ORDINALS.st :
          (b === 2) ? locale.ORDINALS.nd :
            (b === 3) ? locale.ORDINALS.rd : locale.ORDINALS.th;
    return number + output;
  }

  /**
   * For an array of numbers, e.g. a list of hours in a schedule,
   * return a string listing out all of the values (complete with
   * "and" plus ordinal text on the last item).
   * @param {Number[]} numbers
   * @returns {string}
   */
  function numberList(numbers) {
    if (numbers.length < 2) {
      return ordinal(numbers);
    }

    var lastVal = numbers.pop();
    return numbers.join(', ') + ` ${locale['and']} ` + ordinal(lastVal);
  }

  /**
   * Parse a number into day of week, or a month name;
   * used in dateList below.
   * @param {Number|String} value
   * @param {String} type
   * @returns {String}
   */
  function numberToDateName(value, type) {
    if (type == 'dow') {
      return locale.DOW[value - 1];
    } else if (type == 'mon') {
      return locale.MONTH[value - 1];
    }
  }

  /**
   * From an array of numbers corresponding to dates (given in type: either
   * days of the week, or months), return a string listing all the values.
   * @param {Number[]} numbers
   * @param {String} type
   * @returns {String}
   */
  function dateList(numbers, type) {
    if (numbers.length < 2) {
      return numberToDateName('' + numbers[0], type);
    }

    var lastVal = '' + numbers.pop();
    var outputText = '';

    for (var i = 0, value; value = numbers[i]; i++) {
      if (outputText.length > 0) {
        outputText += ', ';
      }
      outputText += numberToDateName(value, type);
    }
    return outputText + ` ${locale['and']} ` + numberToDateName(lastVal, type);
  }

  /**
   * Pad to equivalent of sprintf('%02d').
   * @param {Number} x
   * @returns {string}
   */
  function zeroPad(x) {
    return (x < 10) ? '0' + x : x;
  }

  //----------------

  /**
   * Given a schedule, generate a friendly sentence description.
   * @param {Object} schedule
   * @returns {string}
   */
  function scheduleToSentence(schedule) {
    var outputText = locale.Every + ' ';

    if (schedule['h'] && schedule['m'] && schedule['h'].length <= 2 && schedule['m'].length <= 2) {
      // If there are only one or two specified values for
      // hour or minute, print them in HH:MM format

      var hm = [];
      for (var i = 0; i < schedule['h'].length; i++) {
        for (var j = 0; j < schedule['m'].length; j++) {
          hm.push(zeroPad(schedule['h'][i]) + ':' + zeroPad(schedule['m'][j]));
        }
      }
      if (hm.length < 2) {
        outputText = hm[0];
      } else {
        var lastVal = hm.pop();
        outputText = hm.join(', ') + ` ${locale.and} ` + lastVal;
      }
      if (!schedule['d'] && !schedule['D']) {
        outputText += ` ${locale['every day']}`;
      }
    } else {
      // Otherwise, list out every specified hour/minute value.

      if (schedule['h']) { // runs only at specific hours
        if (schedule['m']) { // and only at specific minutes
          outputText += numberList(schedule['m']) + ` ${locale['minute past the']} ` + numberList(schedule['h']) + ` ${locale['hour']}`;
        } else { // specific hours, but every minute
          outputText += `${locale['minute of']} ` + numberList(schedule['h']) + ` ${locale['hour']}`;
        }
      } else if (schedule['m']) { // every hour, but specific minutes
        outputText += numberList(schedule['m']) + ` ${locale['minute every hour']}`;
      } else { // cronspec has "*" for both hour and minute
        outputText += locale['minute'];
      }
    }

    if (schedule['D']) { // runs only on specific day(s) of month
      outputText += (locale['on the'] ? ` ${locale['on the']} ` : ' ') + numberList(schedule['D']);
      if (!schedule['M']) {
        outputText += ` ${locale['of every month']}`;
      }
    }

    if (schedule['d']) { // runs only on specific day(s) of week
      if (schedule['D']) {
        // if both day fields are specified, cron uses both; superuser.com/a/348372
        outputText += ` ${locale['and every']} `;
      } else {
        outputText += ` ${locale['on']} `;
      }
      outputText += dateList(schedule['d'], 'dow');
    }

    if (schedule['M']) {
      // runs only in specific months; put this output last
      outputText += ` ${locale['in']} ` + dateList(schedule['M'], 'mon');
    }

    return outputText;
  }

  return scheduleToSentence(schedule.schedules[0]);
}

export default cronToText;
