import axios, { type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Axios API contract", () => {
  test.each([
    ["prefectures", "/api/v1/prefectures"],
    ["population", "/api/v1/population/composition/perYear?prefCode=13"],
  ])("preserves the %s request and returns response data", async (kind, path) => {
    vi.stubEnv("VITE_REACT_APP_API_KEY", "unit-test-placeholder");
    const responseData = { result: [] };
    const create = axios.create.bind(axios);
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));
    vi.spyOn(axios, "create").mockImplementation((config) =>
      create({ ...config, adapter })
    );

    const api = await import("./api");
    const result = kind === "prefectures"
      ? await api.fetchPrefectures()
      : await api.fetchPopulation(13);

    expect(result).toEqual(responseData);
    expect(adapter).toHaveBeenCalledOnce();
    const config = adapter.mock.calls[0][0];
    expect(config.method).toBe("get");
    expect(axios.getUri(config)).toBe(
      `https://yumemi-frontend-engineer-codecheck-api.vercel.app${path}`
    );
    expect(config.headers.get("X-API-KEY")).toBe("unit-test-placeholder");
  });
});
