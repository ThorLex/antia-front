// Configuration de base
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Fonction principale pour les requêtes API
const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const token = localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue");
    }

    return data;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

export const getInitialAgencies = () => {
  return [
    {
      id: 1,
      name: "Agence Paris Centre",
      address: "123 Rue de Rivoli, 75001 Paris",
      phone: "01 23 45 67 89",
      email: "paris@agence.com",
      manager: "Marie Dupont",
    },
    {
      id: 2,
      name: "Agence Lyon",
      address: "45 Cours Lafayette, 69003 Lyon",
      phone: "04 78 90 12 34",
      email: "lyon@agence.com",
      manager: "Pierre Martin",
    },
    {
      id: 3,
      name: "Agence Marseille",
      address: "78 La Canebière, 13001 Marseille",
      phone: "04 91 23 45 67",
      email: "marseille@agence.com",
      manager: "Sophie Bernard",
    },
  ];
};

export const getInitialClients = () => {
  return [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "06 12 34 56 78",
      agencyId: 1,
      status: "actif",
      createdAt: "2024-01-15",
      address: "15 Rue de la Paix, Paris",
      notes: "Client VIP",
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie.martin@email.com",
      phone: "06 98 76 54 32",
      agencyId: 1,
      status: "actif",
      createdAt: "2024-02-20",
      address: "28 Avenue des Champs, Paris",
      notes: "",
    },
    {
      id: 3,
      name: "Pierre Dubois",
      email: "pierre.dubois@email.com",
      phone: "06 45 67 89 01",
      agencyId: 2,
      status: "inactif",
      createdAt: "2024-03-10",
      address: "12 Place Bellecour, Lyon",
      notes: "À rappeler",
    },
  ];
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  updateProfile: async (userId, userData) => {
    return await apiRequest(`/auth/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
};

export const agencyAPI = {
  // Récupérer toutes les agences
  getAll: async () => {
    try {
      return await apiRequest("/agencies");
    } catch (error) {
      console.log("Utilisation des données locales");
      return getInitialAgencies();
    }
  },

  // Récupérer une agence par ID
  getById: async (id) => {
    try {
      return await apiRequest(`/agencies/${id}`);
    } catch (error) {
      const agencies = getInitialAgencies();
      return agencies.find((a) => a.id === id);
    }
  },

  // Créer une nouvelle agence
  create: async (agencyData) => {
    try {
      return await apiRequest("/agencies", {
        method: "POST",
        body: JSON.stringify(agencyData),
      });
    } catch (error) {
      // Fallback local
      return { ...agencyData, id: Date.now() };
    }
  },

  // Mettre à jour une agence
  update: async (id, agencyData) => {
    try {
      return await apiRequest(`/agencies/${id}`, {
        method: "PUT",
        body: JSON.stringify(agencyData),
      });
    } catch (error) {
      return { ...agencyData, id };
    }
  },

  // Supprimer une agence
  delete: async (id) => {
    try {
      return await apiRequest(`/agencies/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  },

  // Obtenir le nombre de clients par agence
  getClientCount: async (id) => {
    try {
      return await apiRequest(`/agencies/${id}/clients/count`);
    } catch (error) {
      const clients = getInitialClients();
      return clients.filter((c) => c.agencyId === id).length;
    }
  },
};

export const clientAPI = {
  // Récupérer tous les clients
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await apiRequest(
        `/clients${queryString ? "?" + queryString : ""}`
      );
    } catch (error) {
      console.log("Utilisation des données locales");
      return getInitialClients();
    }
  },

  // Récupérer un client par ID
  getById: async (id) => {
    try {
      return await apiRequest(`/clients/${id}`);
    } catch (error) {
      const clients = getInitialClients();
      return clients.find((c) => c.id === id);
    }
  },

  // Créer un nouveau client
  create: async (clientData) => {
    try {
      return await apiRequest("/clients", {
        method: "POST",
        body: JSON.stringify({
          ...clientData,
          createdAt: new Date().toISOString().split("T")[0],
        }),
      });
    } catch (error) {
      // Fallback local
      return {
        ...clientData,
        id: Date.now(),
        createdAt: new Date().toISOString().split("T")[0],
      };
    }
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    try {
      return await apiRequest(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(clientData),
      });
    } catch (error) {
      return { ...clientData, id };
    }
  },

  // Supprimer un client
  delete: async (id) => {
    try {
      return await apiRequest(`/clients/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  },

  // Rechercher des clients
  search: async (searchTerm) => {
    try {
      return await apiRequest(
        `/clients/search?q=${encodeURIComponent(searchTerm)}`
      );
    } catch (error) {
      const clients = getInitialClients();
      return clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm)
      );
    }
  },

  // Filtrer les clients par agence
  getByAgency: async (agencyId) => {
    try {
      return await apiRequest(`/clients?agencyId=${agencyId}`);
    } catch (error) {
      const clients = getInitialClients();
      return clients.filter((c) => c.agencyId === parseInt(agencyId));
    }
  },

  // Mettre à jour le statut d'un client
  updateStatus: async (id, status) => {
    try {
      return await apiRequest(`/clients/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      throw error;
    }
  },
};

export const productAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/products${queryString ? "?" + queryString : ""}`);
  },

  getById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  create: async (productData) => {
    return await apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  update: async (id, productData) => {
    return await apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/products/${id}`, {
      method: "DELETE",
    });
  },

  search: async (query) => {
    return await apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  },
};

export const fileAPI = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Upload échoué"));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Erreur réseau")));

      xhr.open("POST", `${API_BASE_URL}/upload`);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },
};

export const errorHandler = {
  handle: (error) => {
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      authAPI.logout();
    }
    return error.message;
  },
};

const api = {
  auth: authAPI,
  agency: agencyAPI,
  client: clientAPI,
  errorHandler,
};
export default api;
