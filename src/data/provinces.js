// 巴基斯坦 ADM1 行政区划展示配置
// color: 区域轮廓 / 图例色；dot: 点阵填充色（略亮于区域色，保证点在深绿底上可辨）
// 仅作视觉区分，不代表任何业务数值
export const PROVINCES = [
  { name: 'Punjab',                      cn: '旁遮普',             iso: 'PK-PB', color: '#2ec483', dot: '#46ef9f' },
  { name: 'Sindh',                       cn: '信德',               iso: 'PK-SD', color: '#23a96b', dot: '#33d18a' },
  { name: 'Khyber Pakhtunkhwa',          cn: '开伯尔-普什图',       iso: 'PK-KP', color: '#1b8a56', dot: '#28b673' },
  { name: 'Balochistan',                 cn: '俾路支斯坦',         iso: 'PK-BA', color: '#12653f', dot: '#1c9c60' },
  { name: 'Gilgit-Baltistan',            cn: '吉尔吉特-巴尔蒂斯坦', iso: 'PK-GB', color: '#3fdd9a', dot: '#63ffb4' },
  { name: 'Azad Kashmir',                cn: '自由克什米尔',       iso: 'PK-JK', color: '#59e6a6', dot: '#86ffc8' },
  { name: 'Islamabad Capital Territory', cn: '伊斯兰堡首都区',     iso: 'PK-IS', color: '#7dffb7', dot: '#c2ffe0' },
];

export const PROVINCE_MAP = PROVINCES.reduce((acc, item) => {
  acc[item.name] = item;
  return acc;
}, {});

export const MAP_NAME = 'pakistan';
