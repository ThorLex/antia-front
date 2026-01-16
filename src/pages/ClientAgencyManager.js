import React from "react";

import { useClientAgencyManager } from "../hooks/useClientAgencyManager";
import Modal from "../components/Modal";
import ClientForm from "../components/ClientForm";
import AgencyForm from "../components/AgencyForm";

const ClientAgencyManager = () => {
  const {
    agencies,
    clients,
    filteredClients,
    selectedAgency,
    setSelectedAgency,
    searchTerm,
    setSearchTerm,
    activeModal,
    editingItem,
    handleSaveAgency,
    handleDeleteAgency,
    handleSaveClient,
    handleDeleteClient,
    openModal,
    closeModal,
    getAgencyName,
    getClientCount,
  } = useClientAgencyManager();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Système de Gestion Clients par Agence
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos agences et clients en toute simplicité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Agences</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {agencies.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-3xl font-bold text-green-600">
                  {clients.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clients Filtrés</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredClients.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button className="flex-1 py-4 px-6 text-center font-semibold bg-indigo-600 text-white">
              Gestion des Clients
            </button>
            <button
              onClick={() => openModal("agencyList")}
              className="flex-1 py-4 px-6 text-center font-semibold hover:bg-gray-50 text-gray-700"
            >
              Gestion des Agences
            </button>
          </div>

          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Toutes les agences</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => openModal("client")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-semibold"
                >
                  Ajouter Client
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">Aucun client trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800">
                        {client.name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("client", client)}
                          className="text-blue-600 hover:text-blue-800"
                        ></button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-800"
                        ></button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{client.email}</p>
                      <p> {client.phone}</p>
                      <p className="flex items-center gap-1">
                        {getAgencyName(client.agencyId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Créé le {client.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeModal === "client" && (
        <Modal
          title={editingItem ? "Modifier Client" : "Nouveau Client"}
          onClose={closeModal}
        >
          <ClientForm
            client={editingItem}
            agencies={agencies}
            onSave={handleSaveClient}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {activeModal === "agencyList" && (
        <Modal title="Gestion des Agences" onClose={closeModal}>
          <div className="space-y-4">
            <button
              onClick={() => openModal("agency")}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
            >
              Nouvelle Agence
            </button>
            <div className="space-y-3">
              {agencies.map((agency) => (
                <div
                  key={agency.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {agency.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📍 {agency.address}
                      </p>
                      <p className="text-sm text-gray-600">📞 {agency.phone}</p>
                      <p className="text-xs text-indigo-600 mt-2">
                        {getClientCount(agency.id)} client(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("agency", agency)}
                        className="text-blue-600 hover:text-blue-800"
                      ></button>
                      <button
                        onClick={() => handleDeleteAgency(agency.id)}
                        className="text-red-600 hover:text-red-800"
                      ></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "agency" && (
        <Modal
          title={editingItem ? "Modifier Agence" : "Nouvelle Agence"}
          onClose={closeModal}
        >
          <AgencyForm
            agency={editingItem}
            onSave={handleSaveAgency}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientAgencyManager;
