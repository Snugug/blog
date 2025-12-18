import { BarChart } from 'chartist';

const frequencyChart = document.querySelector('#frequency');

const frequency = JSON.parse(frequencyChart.dataset.frequency);

const high = Math.max(...Object.values(frequency));
const low = Math.min(...Object.values(frequency));
const length = Object.values(frequency).length;

new BarChart(
  '#frequency',
  {
    labels: Object.keys(frequency).map((k) => k - 2000),
    series: [Object.values(frequency)],
  },
  {
    high,
    low,
    axisY: {
      showLabel: false,
      offset: 0,
    },
    axisX: {
      labelInterpolationFnc: (value, index) =>
        index === 0 || index === Math.round(length / 2) || index === length - 1
          ? `'${value.toString().padStart(2, '0')}`
          : null,
    },
  },
);
