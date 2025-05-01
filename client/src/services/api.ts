import axios from 'axios';

const API_URL = 'https://smart-card.tn/api'; // Production API URL

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Card API
export const cardAPI = {
  // Create a new card
  createCard: async (cardData: any) => {
    console.log('API createCard with profile pic:', cardData.profilePic ? 'Present (length: ' + cardData.profilePic.length + ')' : 'Not present');
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  // Get all cards for a user
  getUserCards: async () => {
    const response = await api.get('/cards');
    return response.data;
  },

  // Get a card by ID
  getCardById: async (id: string) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Get a card by unique URL (public)
  getCardByUniqueUrl: async (uniqueUrl: string) => {
    const response = await api.get(`/cards/url/${uniqueUrl}`);
    return response.data;
  },

  // Update a card
  updateCard: async (id: string, cardData: any) => {
    console.log('API updateCard with profile pic:', cardData.profilePic ? 'Present (length: ' + cardData.profilePic.length + ')' : 'Not present');
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  },

  // Delete a card
  deleteCard: async (id: string) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  // Upload an image
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Order API
export const orderAPI = {
  // Create a new order
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get all orders for a user
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get an order by ID
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order card created status
  updateOrderCardCreated: async (id: string, cardCreated: boolean, cardId: string) => {
    const response = await api.put(`/orders/${id}/card-created`, {
      card_created: cardCreated,
      card_id: cardId
    });
    return response.data;
  },
};

export default api;
