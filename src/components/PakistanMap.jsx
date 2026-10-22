import { useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
import geoJson from '../data/pakistan.geo.json';
import dotData from '../data/pakistan.dots.json';
import { MAP_NAME, PROVINCES, PROVINCE_MAP } from '../data/provinces';
import { useEchart } from '../hooks/useEchart';

// 只在模块加载时注册一次地图
if (!echarts.getMap(MAP_NAME)) {
  echarts.registerMap(MAP_NAME, geoJson);
}

// 把逐点数据按省份拆成 7 组，颜色与图例一一对应
const dotsByProvince = PROVINCES.map((province) => {
  const idx = dotData.provinces.indexOf(province.name);
  return idx < 0
    ? []
    : dotData.dots.filter((d) => d[2] === idx).map((d) => [d[0], d[1]]);
});

const baseTextStyle = {
  fontFamily: '"Segoe UI", "Microsoft YaHei", -apple-system, sans-serif',
};

const CITY_SERIES = 'CITIES';

// 城市标点：只显示序号，名称与说明交给图片卡片
const buildCitySeries = (cities, activeSlug) => ({
  type: 'effectScatter',
  name: CITY_SERIES,
  coordinateSystem: 'geo',
  z: 30,
  showEffectOn: 'render',
  rippleEffect: { brushType: 'stroke', scale: 3.2, period: 4.6, number: 2 },
  symbolSize: (value, params) => (params.data.slug === activeSlug ? 17 : 11),
  data: cities.map((c) => ({
    name: c.en,
    slug: c.slug,
    index: c.index,
    cn: c.cn,
    en: c.en,
    tag: c.tag,
    province: c.province,
    img: c.img,
    value: c.coord,
    label: { position: 'top', distance: 9 },
    itemStyle:
      c.slug === activeSlug
        ? { color: '#ffffff', shadowColor: '#fff2a8', shadowBlur: 26 }
        : { color: '#ffe98a', shadowColor: '#ffdf6b', shadowBlur: 14 },
  })),
  labelLayout: { hideOverlap: false, moveOverlap: 'shiftY' },
  label: {
    show: true,
    position: 'top',
    distance: 9,
    formatter: (p) => String(p.data.index ?? '').padStart(2, '0'),
    color: (p) => (p.data.slug === activeSlug ? '#ffffff' : '#ffe9a3'),
    fontSize: (p) => (p.data.slug === activeSlug ? 13 : 11),
    fontWeight: 700,
    textBorderColor: 'rgba(2, 18, 11, 0.92)',
    textBorderWidth: 3,
    backgroundColor: 'rgba(3, 22, 14, 0.82)',
    borderColor: 'rgba(190, 255, 216, 0.35)',
    borderWidth: 1,
    borderRadius: 5,
    padding: [2, 5, 1, 5],
  },
  tooltip: {
    formatter: (p) => buildCityTooltip(p),
  },
});

const buildOption = (cities, activeSlug, mapSize) => ({
  backgroundColor: 'transparent',
  textStyle: baseTextStyle,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(4, 26, 17, 0.94)',
    borderColor: 'rgba(125, 255, 176, 0.45)',
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: '#dcffee', fontSize: 13 },
    extraCssText:
      'border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.5);backdrop-filter:blur(6px);',
    formatter: (params) => {
      if (params.seriesName === CITY_SERIES) return params.data ? buildCityTooltip(params) : '';
      const name = params.name || params.seriesName;
      const meta = PROVINCE_MAP[name];
      if (!meta) return name || '';
      return [
        `<div style="font-weight:700;font-size:14px;letter-spacing:.06em">${meta.name}</div>`,
        `<div style="margin-top:4px;font-size:12px;color:#8fe0b8">${meta.cn} · ${meta.iso}</div>`,
        `<div style="margin-top:2px;font-size:11px;color:#5f9d82">点位 ${dotsByProvince[PROVINCES.indexOf(meta)].length}</div>`,
      ].join('');
    },
  },
  geo: {
    map: MAP_NAME,
    roam: true,
    zoom: 1,
    layoutCenter: ['50%', '53%'],
    layoutSize: mapSize || '100%',
    silent: false,
    itemStyle: {
      // 区域本身不填充，仅留描边，视觉主体交给点阵
      areaColor: 'rgba(10, 74, 48, 0.18)',
      borderColor: 'rgba(150, 255, 205, 0.42)',
      borderWidth: 1,
      shadowColor: 'rgba(46, 220, 140, 0.30)',
      shadowBlur: 18,
    },
    label: {
      show: true,
      color: '#eafff3',
      fontSize: 10,
      fontWeight: 600,
      lineHeight: 13,
      textBorderColor: 'rgba(2, 18, 11, 0.9)',
      textBorderWidth: 2.5,
      formatter: (p) => p.name.replace(' ', '\n').replace('-', '-\n'),
    },
    emphasis: {
      label: { color: '#04241a', fontWeight: 800 },
      itemStyle: {
        areaColor: 'rgba(120, 255, 185, 0.16)',
        borderColor: '#c8ffe4',
        borderWidth: 1.6,
        shadowColor: 'rgba(140, 255, 195, 0.7)',
        shadowBlur: 26,
      },
    },
  },
  series: [
    ...PROVINCES.map((province, i) => ({
      type: 'scatter',
      name: province.name,
      coordinateSystem: 'geo',
      symbol: 'circle',
      symbolSize: 2.9,
      data: dotsByProvince[i],
      z: 5 + i,
      progressive: 2000,
      progressiveThreshold: 4000,
      itemStyle: {
        color: province.dot,
        opacity: 0.95,
        shadowColor: province.color,
        shadowBlur: 5,
      },
      emphasis: {
        scale: false,
        itemStyle: {
          color: '#f2fff8',
          shadowColor: '#b6ffd8',
          shadowBlur: 12,
        },
      },
    })),
    buildCitySeries(cities, activeSlug),
  ],
});

function buildCityTooltip(p) {
  return (
    `<div style="font-weight:700;font-size:14px;letter-spacing:.05em">${p.data.cn} · ${p.data.en}</div>` +
    `<div style="margin-top:4px;font-size:12px;color:#8fe0b8">${PROVINCE_MAP[p.data.province]?.cn || ''}</div>` +
    `<div style="margin-top:2px;font-size:11px;color:#5f9d82">${p.data.tag || ''}</div>`
  );
}

export default function PakistanMap({ cities = [], activeSlug = null, mapSize = null, onPick, onReady }) {
  const option = useMemo(
    () => buildOption(cities, activeSlug, mapSize),
    [cities, activeSlug, mapSize],
  );
  const { containerRef, chartRef } = useEchart(option);

  // 把实例交给父级，用于把经纬度换算成像素（引线端点）
  useEffect(() => {
    if (chartRef.current) onReady?.(chartRef.current);
  }, [chartRef, onReady]);

  // 点阵与区域联动：悬停任一点，整省点位转为高亮色
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return undefined;

    const focus = (name) => {
      const i = PROVINCES.findIndex((p) => p.name === name);
      if (i < 0) return;
      chart.dispatchAction({ type: 'highlight', seriesIndex: i });
      chart.dispatchAction({ type: 'highlight', geoIndex: 0, name });
    };
    const reset = () => chart.dispatchAction({ type: 'downplay' });
    const onHover = (params) => {
      if (params.seriesName === CITY_SERIES) {
        focus(params.data?.province);
        return;
      }
      focus(params.name || params.seriesName);
    };

    const onClick = (params) => {
      if (params.seriesName === CITY_SERIES && params.data?.slug) {
        onPick?.(params.data.slug);
      }
    };

    chart.on('mouseover', onHover);
    chart.on('globalout', reset);
    chart.on('click', onClick);

    return () => {
      chart.off('mouseover', onHover);
      chart.off('globalout', reset);
      chart.off('click', onClick);
    };
  }, [chartRef, onPick]);

  return (
    <div
      ref={containerRef}
      className="map-canvas"
      role="img"
      aria-label="巴基斯坦行政区划点阵地图，标注本次随机抽取的城市"
    />
  );
}
