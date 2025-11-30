// src/lib/requestService.ts
import axios from "axios";

const API_URL = "http://localhost:8001/api/members";

export const requestService = {
  async getAll() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await axios.patch(`${API_URL}/${id}`, { status });
    return response.data;
  },
};
