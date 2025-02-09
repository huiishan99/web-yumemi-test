import React, { useState, useEffect, useCallback, useMemo } from "react";
import PrefectureSelector from "./components/PrefectureSelector";
import { fetchPopulation, fetchPrefectures } from "./api/api";
import PopulationChart from "./components/PopulationChart";
import './App.css';
import { FaSun, FaMoon, FaGithub } from 'react-icons/fa';

// インターフェース定義
interface Prefecture {
  prefCode: number;
  prefName: string;
}

interface PopulationData {
  year: number;
  value: number;
}

interface PopulationTypeData {
  [type: string]: PopulationData[];
}

interface PopulationCompositionPerYear {
  boundaryYear: number;
  data: {
    label: string;
    data: PopulationData[];
  }[];
}

interface PopulationCompositionPerYearResponse {
  message: string;
  result: PopulationCompositionPerYear;
}

const App: React.FC = () => {
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);
  const [populationData, setPopulationData] = useState<{ [prefCode: number]: PopulationTypeData }>({});
  const [currentType, setCurrentType] = useState<string>("総人口");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prefectureNames, setPrefectureNames] = useState<{ [prefCode: number]: string }>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [error] = useState<string | null>(null);

  // 都道府県データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPrefectures();
        const names = response.result.reduce((acc: { [prefCode: number]: string }, pref: Prefecture) => {
          acc[pref.prefCode] = pref.prefName;
          return acc;
        }, {});
        setPrefectureNames(names);
      } catch (error) {
        console.error("都道府県データの取得に失敗:", error);
      }
    };
    fetchData();
  }, []);

  // 都道府県選択を処理
  const handlePrefectureSelect = useCallback(async (selected: number[]) => {
    setSelectedPrefectures(selected);
    setIsLoading(true);

    const newPopulationData = { ...populationData };

    // まだ取得していない人口データを取得
    const fetchPromises = selected
      .filter(prefCode => !newPopulationData[prefCode])
      .map(async (prefCode) => {
        try {
          const response: PopulationCompositionPerYearResponse = await fetchPopulation(prefCode);
          newPopulationData[prefCode] = response.result.data.reduce((acc: PopulationTypeData, item) => {
            acc[item.label] = item.data;
            return acc;
          }, {});
        } catch (error) {
          console.error(`人口データの取得に失敗 (${prefCode}):`, error);
        }
      });

    await Promise.all(fetchPromises);

    setPopulationData(newPopulationData);
    setIsLoading(false);
  }, [populationData]);

  // 人口タイプの変更を処理
  const handleTypeChange = useCallback((type: string) => {
    setCurrentType(type);
  }, []);

  // テーマの切り替え
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // 人口タイプのボタンリスト
  const populationTypeButtons = useMemo(() => (
    ["総人口", "年少人口", "生産年齢人口", "老年人口"].map((type) => (
      <button
        key={type}
        className={`button ${currentType === type ? "button-active" : ""}`}
        onClick={() => handleTypeChange(type)}
      >
        {type}
      </button>
    ))
  ), [currentType, handleTypeChange]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h1 className="app-title">都道府県別の人口推移</h1>

      {/* エラーメッセージ */}
      {error && <p className="error-message">{error}</p>}

      <div className="subtitle-container">
        <h2 className="app-subtitle">都道府県を選択</h2>
        <div className="top-right-buttons">
          <button className="toggle-theme-button" onClick={toggleTheme} aria-label="テーマ切り替え">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="github-button">
            <FaGithub />
          </a>
        </div>
      </div>

      {/* 都道府県選択コンポーネント */}
      <div className="prefecture-selector">
        <PrefectureSelector onSelect={handlePrefectureSelect} />
      </div>

      {/* 人口タイプ選択ボタン */}
      <div className="button-group">{populationTypeButtons}</div>

      {/* 人口データチャート */}
      <div className="chart-container" style={{ opacity: isLoading ? 0.5 : 1 }}>
        <PopulationChart
          data={populationData}
          selected={selectedPrefectures}
          currentType={currentType}
          prefectureNames={prefectureNames}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default App;
