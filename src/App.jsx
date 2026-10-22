import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PakistanMap from './components/PakistanMap';
import LeaderLines from './components/LeaderLines';
import { PROVINCES, PROVINCE_MAP } from './data/provinces';
import { pickRandomCities } from './data/cities';

const CITY_COUNT = 4;

export default function App() {
  // 首次渲染即随机抽 4 城，点击「换一批」重新抽取
  const [cities, setCities] = useState(() => pickRandomCities(CITY_COUNT));
  const [activeSlug, setActiveSlug] = useState(null);
  const [links, setLinks] = useState([]);
  const [mapSize, setMapSize] = useState(null);

  const appRef = useRef(null);
  const colRef = useRef(null);
  const chartRef = useRef(null);
  const cardRefs = useRef({});

  // 地图尺寸：宽屏为「两列卡片之外的可视宽度」，窄屏按高度压缩，保证卡片与地图互不重叠
  useEffect(() => {
    const measure = () => {
      const el = appRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      let size;
      if (w < 980) {
        size = Math.min(w - 72, h - 430);
      } else {
        const colW = colRef.current?.offsetWidth || 268;
        const edge = w < 1200 ? 30 : 56;
        const gap = w < 1200 ? 46 : 86;
        size = Math.min(w - 2 * (edge + colW + gap), h * 0.94);
      }
      setMapSize(Math.round(Math.max(260, size)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 按经度把 4 城分成西侧 / 东侧两组，避免引线相互交叉
  const columns = useMemo(() => {
    const ordered = [...cities]
      .sort((a, b) => a.coord[0] - b.coord[0])
      .map((city, i) => ({ ...city, index: i + 1 }));
    const byLat = (a, b) => b.coord[1] - a.coord[1];
    return {
      west: ordered.slice(0, 2).sort(byLat),
      east: ordered.slice(2).sort(byLat),
    };
  }, [cities]);

  // 地图上标点的绘制顺序（与卡片序号一致）
  const plotCities = useMemo(
    () => [...columns.west, ...columns.east],
    [columns],
  );

  const shuffle = useCallback(() => {
    setCities(pickRandomCities(CITY_COUNT));
    setActiveSlug(null);
  }, []);

  const toggle = useCallback((slug) => {
    setActiveSlug((prev) => (prev === slug ? null : slug));
  }, []);

  // 计算引线：卡片边缘中点 → 城市标点
  const recompute = useCallback(() => {
    const chart = chartRef.current;
    const appEl = appRef.current;
    if (!chart || !appEl) return;

    const appRect = appEl.getBoundingClientRect();
    const mid = appRect.left + appRect.width / 2;
    const next = [];

    plotCities.forEach((city) => {
      const el = cardRefs.current[city.slug];
      if (!el) return;
      let point = null;
      try {
        point = chart.convertToPixel({ geoIndex: 0 }, city.coord);
      } catch (err) {
        point = null;
      }
      if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;

      const rect = el.getBoundingClientRect();
      const onWest = rect.left + rect.width / 2 < mid;
      next.push({
        slug: city.slug,
        active: city.slug === activeSlug,
        from: {
          x: (onWest ? rect.right : rect.left) - appRect.left,
          y: rect.top + rect.height / 2 - appRect.top,
        },
        to: { x: point[0], y: point[1] },
      });
    });

    setLinks((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [plotCities, activeSlug]);

  // 缓存地图实例，并在缩放 / 平移 / 窗口变化 / 卡片尺寸变化时重算引线
  const handleReady = useCallback((chart) => {
    chartRef.current = chart;
  }, []);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };

    schedule();
    const timer = setTimeout(schedule, 260);

    window.addEventListener('resize', schedule);
    const chart = chartRef.current;
    chart?.on('georoam', schedule);
    chart?.on('finished', schedule);

    const ro = new ResizeObserver(schedule);
    if (appRef.current) ro.observe(appRef.current);
    Object.values(cardRefs.current).forEach((el) => el && ro.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', schedule);
      chart?.off('georoam', schedule);
      chart?.off('finished', schedule);
      ro.disconnect();
    };
  }, [recompute]);

  const renderCard = (city) => (
    <li
      key={city.slug}
      ref={(el) => {
        cardRefs.current[city.slug] = el;
      }}
      className={`city-card${city.slug === activeSlug ? ' is-active' : ''}`}
      onClick={() => toggle(city.slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(city.slug);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="city-thumb">
        <img src={city.img} alt={`${city.cn}城市实景`} loading="lazy" />
        <span className="city-index">{String(city.index).padStart(2, '0')}</span>
      </div>
      <div className="city-meta">
        <p className="city-name">
          {city.cn}
          <span className="city-en">{city.en}</span>
        </p>
        <p className="city-tag">{city.tag}</p>
        <p className="city-province">{PROVINCE_MAP[city.province]?.cn || city.province}</p>
      </div>
    </li>
  );

  return (
    <div className="app" ref={appRef}>
      <div className="frame" />
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />

      <header className="app-header">
        <div className="header-row">
          <span className="glass-wing wing-left" aria-hidden="true">
            <i className="pane pane-a" />
            <i className="pane pane-b" />
          </span>
          <div className="header-core">
            <p className="kicker">Islamic Republic of Pakistan</p>
            <h1>PAKISTAN</h1>
            <p className="subtitle">巴基斯坦行政区划 · ADMINISTRATIVE DIVISIONS</p>
          </div>
          <span className="glass-wing wing-right" aria-hidden="true">
            <i className="pane pane-a" />
            <i className="pane pane-b" />
          </span>
        </div>
      </header>

      <div className="stats">
        <b>{PROVINCES.length}</b>
        <span>PROVINCES / TERRITORIES</span>
      </div>

      <main className="map-wrap">
        <PakistanMap
          cities={plotCities}
          activeSlug={activeSlug}
          mapSize={mapSize}
          onPick={toggle}
          onReady={handleReady}
        />
      </main>

      <LeaderLines links={links} />

      <ul
        className="city-col city-col-west"
        ref={colRef}
        key={`west-${cities.map((c) => c.slug).join('-')}`}
      >
        {columns.west.map(renderCard)}
      </ul>

      <ul className="city-col city-col-east" key={`east-${cities.map((c) => c.slug).join('-')}`}>
        {columns.east.map(renderCard)}
      </ul>

      <div className="legend">
        <ul>
          {PROVINCES.map((p) => (
            <li key={p.name}>
              <i style={{ background: p.color }} />
              <span className="legend-cn">{p.cn}</span>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className="shuffle-btn" onClick={shuffle}>
        <span className="shuffle-icon" aria-hidden="true">
          ⟳
        </span>
        换一批城市
      </button>

      <p className="hint">滚轮缩放 · 拖拽平移 · 点击标点或图片高亮对应城市</p>
    </div>
  );
}
