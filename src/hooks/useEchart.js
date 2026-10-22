import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * 通用 ECharts 实例管理：初始化、容器自适应、销毁
 * @param {object} option 图表配置
 */
export function useEchart(option) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const chart = echarts.init(el, null, { renderer: 'canvas' });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart && option) chart.setOption(option, true);
  }, [option]);

  return { containerRef, chartRef };
}
