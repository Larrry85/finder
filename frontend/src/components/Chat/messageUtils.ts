import axios from "axios";

export const markMessagesAsRead = async (senderId: number) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  try {
    await axios.post(
      `http://localhost:8080/api/messages/mark-read?senderId=${senderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};
