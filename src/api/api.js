import axios from "axios";

export const GATEWAY_BASE = ""

const api = axios.create({
    baseURL: GATEWAY_BASE,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
    timeout: 10000
});

// Убираем интерцептор с токеном, так как теперь используем cookies
// Но оставляем для обратной совместимости с REST API
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("token");
    if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers["Authorization"] = `Bearer ${token}`;
    }
    return cfg;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API error:", err);
        
        // Безопасная проверка status
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        
        return Promise.reject(err);
    }
);

function imageUrl(name) {
    if (!name) return null;
    return `${GATEWAY_BASE}/images/${name}`;
}

// WebSocket соединение
let chatSocket = null;

export const chatService = {
    connect: (onMessage, onOpen, onClose, onError) => {
        if (chatSocket) {
            chatSocket.close();
        }
        
        // Используем WSS вместо WS
        const wsUrl = `wss://localhost:50050/ws`;
        
        chatSocket = new WebSocket(wsUrl);
        
        chatSocket.onopen = onOpen;
        chatSocket.onclose = onClose;
        chatSocket.onerror = onError;
        chatSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                if (message.error === "unauthorized") {
                    console.warn("Unauthorized access attempt");
                    if (typeof onMessage === 'function') {
                        onMessage({
                            id: Date.now(),
                            author_name: "System",
                            content: "Error: You are not authorized to send messages",
                            created_at: new Date().toISOString(),
                            isSystem: true
                        });
                    }
                } else {
                    onMessage(message);
                }
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };
        
        return chatSocket;
    },
    
    sendMessage: (content) => {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const messageData = {
                content,
                tempId 
            };
            chatSocket.send(JSON.stringify(messageData));
            return tempId;
        }
        return null;
    },
    
    disconnect: () => {
        if (chatSocket) {
            chatSocket.close();
            chatSocket = null;
        }
    },
    
    getReadyState: () => {
        return chatSocket ? chatSocket.readyState : WebSocket.CLOSED;
    }
};

export default {
    register: (email, password, nickname) => api.post("/api/auth/register", {email, password, nickname}),
    login: (email, password, app_id = 1) =>
  api.post("/api/auth/login", { email, password, app_id })
    .then(response => {
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? '; Secure' : '';
      const sameSiteFlag = isProduction ? '; SameSite=None' : '; SameSite=Lax';

      document.cookie = `access_token=${response.data.token}; path=/; max-age=3600${secureFlag}${sameSiteFlag}`;
      localStorage.setItem("token", response.data.token);

      return response;
    }),

    
    listCategories: () => api.get("/api/forum/categories"),
    getCategory: (id) => api.get(`/api/forum/categories/${id}`),
    createCategory: (name) => api.post("/api/forum/categories", {name}),
    updateCategory: (id, name) => api.put(`/api/forum/categories/${id}`, {id, name}),
    deleteCategory: (id) => api.delete(`/api/forum/categories/${id}`),

    listTopics: (categoryId) => api.get("/api/forum/topics", {params: categoryId ? {category_id: categoryId} : {}}),
    getTopic: (id) => api.get(`/api/forum/topics/${id}`),
    createTopic: (title, categoryId, content) => api.post("/api/forum/topics", {
        title,
        category_id: categoryId,
        content
    }),
    updateTopic: (id, title, categoryId) => api.put(`/api/forum/topics/${id}`, {id, title, category_id: categoryId}),
    deleteTopic: (id) => api.delete(`/api/forum/topics/${id}`),

    listPosts: (topicId) => api.get("/api/forum/posts", {params: {topic_id: topicId}}),
    getPost: (id) => api.get(`/api/forum/posts/${id}`),
    createPost: (topicId, title, content, formData = null) => {
        if (formData) {
            return api.post(`/api/forum/posts`, formData, {headers: {"Content-Type": "multipart/form-data"}});
        }
        return api.post("/api/forum/posts", {topic_id: topicId, title, content});
    },
    updatePost: (id, title, content) => api.put(`/api/forum/posts/${id}`, {id, title, content}),
    deletePost: (id) => api.delete(`/api/forum/posts/${id}`),
    search: (query) => {
        const token = localStorage.getItem("token");
        return axios.get(`${baseUrl}/api/forum/search?q=${encodeURIComponent(query)}`, {
            headers: {
            Authorization: token ? token : "",
            },
        });
        },
    listComments: (postId) => api.get("/api/forum/comments", {params: {post_id: postId}}),
    getComment: (id) => api.get(`/api/forum/comments/${id}`),
    createComment: (postId, content) => api.post("/api/forum/comments", {post_id: postId, content}),
    updateComment: (id, content) => api.put(`/api/forum/comments/${id}`, {id, content}),
    deleteComment: (id) => api.delete(`/api/forum/comments/${id}`),

    imageUrl,
    GATEWAY_BASE
};