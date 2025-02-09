import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import App from "../App";

// API のモック
vi.mock("../api/api", () => ({
  fetchPrefectures: vi.fn(() =>
    Promise.resolve({
      result: [
        { prefCode: 1, prefName: "北海道" },
        { prefCode: 2, prefName: "青森県" },
      ],
    })
  ),
  fetchPopulation: vi.fn(() =>
    Promise.resolve({
      result: {
        boundaryYear: 2020,
        data: [
          { label: "総人口", data: [{ year: 2020, value: 5000000 }] },
        ],
      },
    })
  ),
}));

describe("App.tsx", () => {
  test("アプリが正常にレンダリングされる", async () => {
    render(<App />);
    expect(screen.getByText("都道府県別の人口推移")).toBeInTheDocument();
    expect(screen.getByText("都道府県を選択")).toBeInTheDocument();
  });

  test("テーマ切り替えボタンをクリックするとテーマが切り替わる", async () => {
    render(<App />);
    const themeButton = screen.getByLabelText("テーマ切り替え");
    expect(themeButton).toBeInTheDocument();

    await userEvent.click(themeButton);
    expect(document.body.classList.contains("light-mode")).toBe(true);
    await userEvent.click(themeButton);
    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  test("人口タイプのボタンが表示される", () => {
    render(<App />);
    expect(screen.getByText("総人口")).toBeInTheDocument();
    expect(screen.getByText("年少人口")).toBeInTheDocument();
    expect(screen.getByText("生産年齢人口")).toBeInTheDocument();
    expect(screen.getByText("老年人口")).toBeInTheDocument();
  });

  test("都道府県選択時に PrefectureSelector の onSelect が呼ばれる", async () => {
    render(<App />);
    
    const checkbox = await screen.findByLabelText("北海道");
    expect(checkbox).toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
