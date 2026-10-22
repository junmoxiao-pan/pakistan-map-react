/**
 * 引线层：把地图上的标点用折线连到左右两侧的图片卡片
 * links: [{ slug, active, from:{x,y}, to:{x,y} }]
 *   from —— 卡片朝向地图一侧的中心（卡片边缘）
 *   to   —— 城市标点的像素坐标（由 ECharts convertToPixel 换算）
 */
export default function LeaderLines({ links = [] }) {
  return (
    <svg className="leader-layer" aria-hidden="true">
      {links.map((link) => {
        const dir = link.to.x >= link.from.x ? 1 : -1;
        const elbowX = link.from.x + dir * 34;
        const d = `M ${link.from.x} ${link.from.y} L ${elbowX} ${link.from.y} L ${link.to.x} ${link.to.y}`;
        return (
          <g key={link.slug} className={link.active ? 'leader is-active' : 'leader'}>
            <path d={d} className="leader-path" />
            <path d={d} className="leader-path leader-glow" />
            <circle cx={link.from.x} cy={link.from.y} r="2.8" className="leader-origin" />
            <circle
              cx={link.to.x}
              cy={link.to.y}
              r={link.active ? 5 : 3.4}
              className="leader-end"
            />
          </g>
        );
      })}
    </svg>
  );
}
