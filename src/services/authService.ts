import api from "./api";

export const login = async (username: string, password: string) => {
    try {
        const res = await api.post("/auth/login", { username, password });

        console.log("Login API Response:", res.data.value);

        // Ensure response structure is correct
        if (!res.data || !res.data.value.token || !res.data.value.user) {
            console.error("Unexpected API response format:", res);
            throw new Error("Invalid response from server");
        }

        const { token, user } = res.data.value;

        // Ensure localStorage is available
        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role_name); 
            localStorage.setItem("userID", user.ID);
        } else {
            console.warn("localStorage is not available in this environment.");
        }

        console.log("Response values:", token, user);
        return { token, user };

    } catch (error) {
        console.error("Login failed:", error);
        throw error; // Ensure the calling function knows an error occurred
    }
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }
};
