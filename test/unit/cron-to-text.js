import cronToText from '../../src/cron-to-text';

describe('cronToText', () => {
  describe('parse cron expressions', () => {
    it('should parse expressions and return readable text', () => {
      [
        {cron: '0 * * * *', readable: 'Every 0th minute every hour'},
        {cron: '30 * * * 1', readable: 'Every 30th minute every hour on Mon'},
        {cron: '15,45 9,21 * * *', readable: '09:15, 09:45, 21:15 and 21:45 every day'},
        {cron: '18,19 7 5 * *', readable: '07:18 and 07:19 on the 5th of every month'},
        {cron: '* * 25 12 *', readable: 'Every minute on the 25th in Dec'},
        {cron: '0 * 1,3 * *', readable: 'Every 0th minute every hour on the 1 and 3rd of every month'},
        {cron: '0 17 * 1,4,7,10 *', readable: '17:00 every day in Jan, Apr, Jul and Oct'},
        {cron: '15 * * * 1,2', readable: 'Every 15th minute every hour on Mon and Tue'},
        {cron: '* 8,10,12,14,16,18,20 * * *', readable: 'Every minute of 8, 10, 12, 14, 16, 18 and 20th hour'},
        {cron: '0 12 15,16 1 3', readable: '12:00 on the 15 and 16th and every Wed in Jan'},
        {cron: '0 4,8,12,4 * * 4,5,6', readable: 'Every 0th minute past the 4, 8 and 12th hour on Thu, Fri and Sat'},
        {
          cron: '0 2,16 1,8,15,22 * 1,2',
          readable: '02:00 and 16:00 on the 1, 8, 15 and 22nd of every month and every Mon and Tue'
        },
        {
          cron: '15 3,8,10,12,14,16,18 16 * *',
          readable: 'Every 15th minute past the 3, 8, 10, 12, 14, 16 and 18th hour on the 16th of every month'
        },
        {
          cron: '2 8,10,12,14,16,18 * 8 0,3',
          readable: 'Every 2nd minute past the 8, 10, 12, 14, 16 and 18th hour on Sun and Wed in Aug'
        }
      ].forEach(item => {
        expect(cronToText(item.cron, false)).to.equal(item.readable)
      })
    });

    it('should work with custom locales', () => {
      const LOCALE_RU = {
        ORDINALS: {
          th: '',
          st: '',
          nd: '',
          rd: ''
        },
        MONTH: [
          'янв',
          'фев',
          'март',
          'апр',
          'май',
          'июнь',
          'июль',
          'авг',
          'сен',
          'окт',
          'ноя',
          'дек'
        ],
        DOW: [
          'вс',
          'пн',
          'вт',
          'ср',
          'чт',
          'пт',
          'сб'
        ],
        'Every': 'Каждая',
        'and': 'и',
        'every day': 'каждый день',
        'minute past the': 'минута в',
        'hour': 'час',
        'minute': 'минута',
        'minute of': 'минута',
        'minute every hour': 'минута каждого часа',
        'on the': '',
        'of every month': 'числа каждого месяца',
        'and every': 'и каждый',
        'on': 'по',
        'in': 'в'
      };

      [
        {cron: '0 * * * *', readable: 'Каждая 0 минута каждого часа'},
        {cron: '30 * * * 1', readable: 'Каждая 30 минута каждого часа по пн'},
        {cron: '15,45 9,21 * * *', readable: '09:15, 09:45, 21:15 и 21:45 каждый день'},
        {cron: '18,19 7 5 * *', readable: '07:18 и 07:19 5 числа каждого месяца'},
        {cron: '* * 25 12 *', readable: 'Каждая минута 25 в дек'},
        {cron: '0 * 1,3 * *', readable: 'Каждая 0 минута каждого часа 1 и 3 числа каждого месяца'},
        {cron: '0 17 * 1,4,7,10 *', readable: '17:00 каждый день в янв, апр, июль и окт'},
        {cron: '15 * * * 1,2', readable: 'Каждая 15 минута каждого часа по пн и вт'},
        {cron: '* 8,10,12,14,16,18,20 * * *', readable: 'Каждая минута 8, 10, 12, 14, 16, 18 и 20 час'},
        {cron: '0 12 15,16 1 3', readable: '12:00 15 и 16 и каждый ср в янв'},
        {cron: '0 4,8,12,4 * * 4,5,6', readable: 'Каждая 0 минута в 4, 8 и 12 час по чт, пт и сб'},
        {
          cron: '0 2,16 1,8,15,22 * 1,2',
          readable: '02:00 и 16:00 1, 8, 15 и 22 числа каждого месяца и каждый пн и вт'
        },
        {
          cron: '15 3,8,10,12,14,16,18 16 * *',
          readable: 'Каждая 15 минута в 3, 8, 10, 12, 14, 16 и 18 час 16 числа каждого месяца'
        },
        {
          cron: '2 8,10,12,14,16,18 * 8 0,3',
          readable: 'Каждая 2 минута в 8, 10, 12, 14, 16 и 18 час по вс и ср в авг'
        }
      ].forEach(item => {
        expect(cronToText(item.cron, false, LOCALE_RU)).to.equal(item.readable)
      })
    });
  });
});
