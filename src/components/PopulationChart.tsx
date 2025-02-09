import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// コンポーネントのプロパティ定義
interface Props {
  data: { [prefCode: number]: { [type: string]: { year: number; value: number }[] } };
  selected: number[];
  currentType: string;
  prefectureNames: { [prefCode: number]: string };
  isDarkMode: boolean;
}

const PopulationChart: React.FC<Props> = ({ data, selected, currentType, prefectureNames, isDarkMode }) => {
  // 現在の人口タイプに応じたタイトルを設定
  const getTitle = (type: string) => {
    switch (type) {
      case "年少人口":
        return "年少人口の推移";
      case "生産年齢人口":
        return "生産年齢人口の推移";
      case "老年人口":
        return "老年人口の推移";
      default:
        return "総人口の推移";
    }
  };

  // データポイントのマーカー設定
  const markerOptions = {
    enabled: false,
    states: {
      hover: {
        enabled: true,
        radius: 5,
      },
    },
  };

  // Highcharts のオプション設定
  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: isDarkMode ? "#0b0f17" : "#ffffff",
      style: {
        color: isDarkMode ? "#ffffff" : "#000000",
      },
    },
    title: {
      text: getTitle(currentType),
      style: {
        color: isDarkMode ? "#ffffff" : "#000000",
      },
    },
    xAxis: {
      title: {
        text: "年",
        style: {
          color: isDarkMode ? "#ffffff" : "#000000",
        },
      },
      categories:
        selected.length > 0
          ? data[selected[0]]?.[currentType]?.map((item) => item.year.toString()) || []
          : [],
      labels: {
        style: {
          color: isDarkMode ? "#e2e8f0" : "#333333",
        },
      },
    },
    yAxis: {
      title: {
        text: "人口数",
        style: {
          color: isDarkMode ? "#ffffff" : "#000000",
        },
      },
      labels: {
        style: {
          color: isDarkMode ? "#e2e8f0" : "#333333",
        },
      },
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "top",
      itemStyle: {
        fontSize: "12px",
        color: isDarkMode ? "#e2e8f0" : "#333333",
      },
    },
    tooltip: {
      shared: true,
      backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
      style: {
        color: isDarkMode ? "#ffffff" : "#000000",
      },
    },
    plotOptions: {
      series: {
        marker: markerOptions,
      },
    },
    series: selected.map((prefCode) => ({
      type: "line",
      name: prefectureNames[prefCode],
      data: data[prefCode]?.[currentType]?.map((item) => item.value) || [],
    })),
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default PopulationChart;
