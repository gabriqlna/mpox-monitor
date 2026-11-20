export const config = {
  dataMode: process.env.DATA_MODE === "live" ? "live" : "fixture",
  timeZone: process.env.APP_TIME_ZONE ?? "America/Sao_Paulo",
};
