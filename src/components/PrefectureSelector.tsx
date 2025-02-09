import React, { useEffect, useState, useCallback, useMemo } from "react";
import { fetchPrefectures } from "../api/api";

// 都道府県データの型定義
interface Prefecture {
  prefCode: number;
  prefName: string;
}

interface PrefecturesResponse {
  message: string;
  result: Prefecture[];
}

// コンポーネントのプロパティ定義
interface Props {
  onSelect: (selected: number[]) => void;
}

const PrefectureSelector: React.FC<Props> = ({ onSelect }) => {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ状態

  // 都道府県データを取得
  useEffect(() => {
    const loadPrefectures = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: PrefecturesResponse = await fetchPrefectures();
        setPrefectures(response.result);
      } catch (err) {
        console.error("都道府県データの取得に失敗:", err);
        setError("データを読み込めませんでした。しばらくしてから再試行してください。");
      } finally {
        setLoading(false);
      }
    };
    loadPrefectures();
  }, []);

  // チェックボックスの変更処理
  const handleChange = useCallback(
    (prefCode: number) => {
      setSelected((prevSelected) => {
        const updatedSelected = prevSelected.includes(prefCode)
          ? prevSelected.filter((code) => code !== prefCode)
          : [...prevSelected, prefCode];

        onSelect(updatedSelected);
        return updatedSelected;
      });
    },
    [onSelect]
  );

  // 都道府県リストのレンダリングを最適化
  const prefectureList = useMemo(
    () =>
      prefectures.map((pref) => (
        <label
          key={pref.prefCode}
          className="prefecture-label"
          aria-label={`${pref.prefName} を選択`}
        >
          <input
            type="checkbox"
            value={pref.prefCode}
            checked={selected.includes(pref.prefCode)}
            onChange={() => handleChange(pref.prefCode)}
            className="prefecture-checkbox"
          />
          <span className="prefecture-name">{pref.prefName}</span>
        </label>
      )),
    [prefectures, selected, handleChange]
  );

  return (
    <div className="prefecture-selector">
      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        prefectureList
      )}
    </div>
  );
};

export default PrefectureSelector;
