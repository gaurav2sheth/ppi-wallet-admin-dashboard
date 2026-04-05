import ReactECharts from 'echarts-for-react';

interface SparklineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export function SparklineChart({ data, color, width = 100, height = 36 }: SparklineChartProps) {
  const option = {
    grid: { top: 2, right: 2, bottom: 2, left: 2 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '30' },
            { offset: 1, color: color + '05' },
          ],
        },
      },
    }],
    tooltip: { show: false },
  };

  return (
    <ReactECharts
      option={option}
      style={{ width, height }}
      opts={{ renderer: 'svg' }}
    />
  );
}
