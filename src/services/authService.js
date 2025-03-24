import api from "./api";

// Refresh token yordamida yangi access token olish
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Refresh token topilmadi!");
  }

  try {
    const response = await api.post("/refresh", { refreshToken });
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("Refresh token bilan yangilashda xato!");
  }
};