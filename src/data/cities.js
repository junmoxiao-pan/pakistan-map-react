// 随机展示用的城市池
// coord: [经度, 纬度]，与地图 geo 坐标系一致
// province: 对应 provinces.js 中的 ADM1 名称
// img: public/cities 下的实景图（维基共享资源，已本地化）
export const CITIES = [
  {
    slug: 'karachi',
    en: 'Karachi',
    cn: '卡拉奇',
    province: 'Sindh',
    coord: [67.0011, 24.8607],
    img: '/cities/karachi.jpg',
    tag: '全国最大城市 · 阿拉伯海门户',
  },
  {
    slug: 'lahore',
    en: 'Lahore',
    cn: '拉合尔',
    province: 'Punjab',
    coord: [74.3587, 31.5204],
    img: '/cities/lahore.jpg',
    tag: '莫卧儿古都 · 文化心脏',
  },
  {
    slug: 'islamabad',
    en: 'Islamabad',
    cn: '伊斯兰堡',
    province: 'Islamabad Capital Territory',
    coord: [73.0479, 33.6844],
    img: '/cities/islamabad.jpg',
    tag: '首都 · 费萨尔清真寺',
  },
  {
    slug: 'quetta',
    en: 'Quetta',
    cn: '奎达',
    province: 'Balochistan',
    coord: [66.975, 30.1798],
    img: '/cities/quetta.jpg',
    tag: '俾路支首府 · 高山果园之城',
  },
  {
    slug: 'rawalpindi',
    en: 'Rawalpindi',
    cn: '拉瓦尔品第',
    province: 'Punjab',
    coord: [73.0333, 33.6],
    img: '/cities/rawalpindi.jpg',
    tag: '双城之一 · 军事与商贸枢纽',
  },
  {
    slug: 'faisalabad',
    en: 'Faisalabad',
    cn: '费萨拉巴德',
    province: 'Punjab',
    coord: [73.0911, 31.4167],
    img: '/cities/faisalabad.jpg',
    tag: '纺织之都 · 旁遮普平原',
  },
  {
    slug: 'peshawar',
    en: 'Peshawar',
    cn: '白沙瓦',
    province: 'Khyber Pakhtunkhwa',
    coord: [71.5675, 34.0144],
    img: '/cities/peshawar.jpg',
    tag: '开伯尔山口 · 丝路旧城',
  },
  {
    slug: 'skardu',
    en: 'Skardu',
    cn: '斯卡杜',
    province: 'Gilgit-Baltistan',
    coord: [75.6333, 35.2971],
    img: '/cities/skardu.jpg',
    tag: '喀喇昆仑门户 · 香格里拉湖',
  },
];

/** 随机不放回抽取 count 座城市 */
export function pickRandomCities(count = 4) {
  const list = [...CITIES];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
}
