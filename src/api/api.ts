import axios from "axios";

// APIの基本URL
const BASE_URL = "https://yumemi-frontend-engineer-codecheck-api.vercel.app";

// 環境変数からAPIキーを取得
const API_KEY =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_REACT_APP_API_KEY
    : process.env.VITE_REACT_APP_API_KEY;

// APIキーが設定されていない場合はエラーをスロー
if (!API_KEY) {
  throw new Error("API Keyが設定されていません");
}

// axiosインスタンスを作成し、デフォルトのリクエストヘッダーを設定
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-API-KEY": API_KEY, // APIキーをリクエストヘッダーに設定
  },
});

// 都道府県一覧を取得する関数
export const fetchPrefectures = async () => {
  const response = await apiClient.get("/api/v1/prefectures");
  return response.data;
};

// 人口データを取得する関数
export const fetchPopulation = async (prefCode: number) => {
  const response = await apiClient.get(
    `/api/v1/population/composition/perYear?prefCode=${prefCode}`
  );
  return response.data;
};
