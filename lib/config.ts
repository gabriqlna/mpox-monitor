export const config = {
  get dataMode(): "live" | "fixture" {
    return process.env.DATA_MODE === "live" ? "live" : "fixture";
  },
  get timeZone(): string {
    return process.env.APP_TIME_ZONE ?? "America/Sao_Paulo";
  },
};
