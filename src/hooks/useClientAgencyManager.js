import { useState, useEffect } from "react";
import {
  agencyAPI,
  clientAPI,
  getInitialAgencies,
  getInitialClients,
} from "../services/api";

export const useClientAgencyManager = () => {
  const [agencies, setAgencies] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fonction pour charger les données initiales
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Essayer de charger depuis l'API
      const [agenciesData, clientsData] = await Promise.all([
        agencyAPI.getAll(),
        clientAPI.getAll(),
      ]);

      setAgencies(agenciesData);
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      // Fallback sur les données locales
      setAgencies(getInitialAgencies());
      const initialClients = getInitialClients();
      setClients(initialClients);
      setFilteredClients(initialClients);
      setError("Utilisation des données locales");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des clients
  useEffect(() => {
    let filtered = clients;

    if (selectedAgency !== "all") {
      filtered = filtered.filter(
        (c) => c.agencyId === parseInt(selectedAgency)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm)
      );
    }

    setFilteredClients(filtered);
  }, [clients, selectedAgency, searchTerm]);

  // ============================================
  // GESTION DES AGENCES
  // ============================================

  const handleSaveAgency = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      if (editingItem) {
        // Mise à jour d'une agence existante
        const updatedAgency = await agencyAPI.update(editingItem.id, formData);
        setAgencies(
          agencies.map((a) =>
            a.id === editingItem.id
              ? { ...updatedAgency, id: editingItem.id }
              : a
          )
        );
      } else {
        // Création d'une nouvelle agence
        const newAgency = await agencyAPI.create(formData);
        setAgencies([...agencies, newAgency]);
      }
      closeModal();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'agence:", err);
      setError(err.message);

      // Fallback local en cas d'erreur
      if (editingItem) {
        setAgencies(
          agencies.map((a) =>
            a.id === editingItem.id ? { ...formData, id: editingItem.id } : a
          )
        );
      } else {
        const newAgency = { ...formData, id: Date.now() };
        setAgencies([...agencies, newAgency]);
      }
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgency = async (id) => {
    // Vérifier si l'agence a des clients
    const hasClients = clients.some((c) => c.agencyId === id);
    if (hasClients) {
      alert(
        "Impossible de supprimer cette agence car elle a des clients associés."
      );
      return;
    }

    if (!window.confirm("Voulez-vous vraiment supprimer cette agence ?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await agencyAPI.delete(id);
      setAgencies(agencies.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression de l'agence:", err);
      setError(err.message);
      // Supprimer localement en cas d'erreur
      setAgencies(agencies.filter((a) => a.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // GESTION DES CLIENTS
  // ============================================

  const handleSaveClient = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      if (editingItem) {
        // Mise à jour d'un client existant
        const updatedClient = await clientAPI.update(editingItem.id, formData);
        setClients(
          clients.map((c) =>
            c.id === editingItem.id
              ? { ...updatedClient, id: editingItem.id }
              : c
          )
        );
      } else {
        // Création d'un nouveau client
        const newClient = await clientAPI.create(formData);
        setClients([...clients, newClient]);
      }
      closeModal();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du client:", err);
      setError(err.message);

      // Fallback local en cas d'erreur
      if (editingItem) {
        setClients(
          clients.map((c) =>
            c.id === editingItem.id ? { ...formData, id: editingItem.id } : c
          )
        );
      } else {
        const newClient = {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString().split("T")[0],
        };
        setClients([...clients, newClient]);
      }
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await clientAPI.delete(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression du client:", err);
      setError(err.message);
      // Supprimer localement en cas d'erreur
      setClients(clients.filter((c) => c.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClients = async (term) => {
    setSearchTerm(term);

    if (!term) {
      setFilteredClients(clients);
      return;
    }

    try {
      const results = await clientAPI.search(term);
      setFilteredClients(results);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      // Fallback sur le filtrage local
      const filtered = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(term.toLowerCase()) ||
          c.email.toLowerCase().includes(term.toLowerCase()) ||
          c.phone.includes(term)
      );
      setFilteredClients(filtered);
    }
  };

  // ============================================
  // GESTION DES MODALS
  // ============================================

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditingItem(item);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
    setError(null);
  };

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  const getAgencyName = (agencyId) => {
    const agency = agencies.find((a) => a.id === agencyId);
    return agency ? agency.name : "N/A";
  };

  const getClientCount = (agencyId) => {
    return clients.filter((c) => c.agencyId === agencyId).length;
  };

  const refreshData = () => {
    loadInitialData();
  };

  // ============================================
  // RETURN
  // ============================================

  return {
    // États
    agencies,
    clients,
    filteredClients,
    selectedAgency,
    searchTerm,
    activeModal,
    editingItem,
    loading,
    error,

    // Setters
    setSelectedAgency,
    setSearchTerm,

    // Handlers Agences
    handleSaveAgency,
    handleDeleteAgency,

    // Handlers Clients
    handleSaveClient,
    handleDeleteClient,
    handleSearchClients,

    // Modals
    openModal,
    closeModal,

    // Utilitaires
    getAgencyName,
    getClientCount,
    refreshData,
  };
};
