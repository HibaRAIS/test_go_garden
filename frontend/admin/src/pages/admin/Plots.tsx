import { useState, useEffect, useMemo } from "react";
import { Search, Plus, MapPin, AlertTriangle, List, Check, X, Trash2, Leaf, Send  } from "lucide-react";
import { PlotCard } from "../../components/PlotCard";
import { Plot } from "../../lib/plots";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { plotService, Member, Plant } from "../../services/plotService";

type AdminView = 'plots' | 'requests';
type RequestFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function Plots() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [occupants, setOccupants] = useState<Member[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "occupied" | "available">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>('plots');
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('pending');
  const [newPlot, setNewPlot] = useState({
    name: "",
    surface: "",
    soil_type: "",
    image: "",
    status: "available",
    _file: undefined as File | undefined,
  });

  // --- Ajout des états de sécurité ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const soilTypes = ["Argileux", "Sableux", "Limonneux", "Calcaire", "Humifère"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPlot((prev) => ({ ...prev, _file: file }));
    }
  };

  // --- Le useEffect est maintenant sécurisé ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté...");
        setLoading(false);
        return;
      }
      try {
        // On lance les deux requêtes en parallèle pour être plus efficace
        const [plotsData, membersData, plantsData, requestsData] = await Promise.all([
          plotService.getAll(),
          plotService.getAvailableMembers(), // Appel à la nouvelle fonction
          plotService.getAvailablePlants(), // Appel à la nouvelle fonction
          plotService.getAllRequests()
        ]);
        setPlots(plotsData);
        setOccupants(membersData);
        setPlants(plantsData); // On remplit le state des plantes
        setRequests(requestsData);
      } catch (err: any) {
        setError("Accès refusé ou erreur réseau.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Vos fonctions handlers ---
  const handleDeletePlot = async (id: string | number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette parcelle ?")) return;
    try {
      await plotService.delete(id);
      setPlots(plots.filter((p) => p.id !== id));
      alert("✅ Parcelle supprimée avec succès !");
    } catch {
      alert("❌ Erreur lors de la suppression.");
    }
  };

  const handleAddPlot = async () => {
    if (!newPlot.name.trim() || !newPlot.surface.trim()) {
      alert("Le nom et la surface de la parcelle sont obligatoires.");
      return; // On arrête l'exécution si les champs sont vides
    }
    try {
      const createdPlot = await plotService.create(newPlot as any);
      setPlots(prevPlots => [...prevPlots, createdPlot]);
      setIsAddDialogOpen(false);
      resetForm();
      alert("✅ Parcelle ajoutée avec succès !");
    } catch {
      alert("❌ Erreur lors de la création.");
    }
  };

  const handleUpdatePlot = async (id: string | number) => {
    // On convertit `surface` en chaîne pour la validation, puis on vérifie si c'est vide.
    if (!newPlot.name.trim() || !String(newPlot.surface).trim()) {
      alert("Le nom et la surface de la parcelle sont obligatoires.");
      return;
    }
    try {
      const updatedPlot = await plotService.update(id, newPlot as any);
      setPlots(plots.map((p) => (p.id === id ? updatedPlot : p)));
      setIsAddDialogOpen(false);
      resetForm();
      alert("✅ Parcelle mise à jour avec succès !");
    } catch {
      alert("❌ Erreur lors de la mise à jour.");
    }
  };

  // NOUVELLES FONCTIONS HANDLER pour approuver/refuser pour les demandes
  const handleApprove = async (requestId: number) => {
    if (!confirm("Voulez-vous vraiment approuver cette demande ?")) return;
    try {
      await plotService.approveRequest(requestId);
      // On met à jour le state des demandes en filtrant celle qui vient d'être traitée
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'approved' } : req));
      // Optionnel : re-fetcher les plots pour mettre à jour l'occupation
      const plotsData = await plotService.getAll();
      setPlots(plotsData);
      alert("✅ Demande approuvée ! La parcelle a été assignée.");
    } catch {
      alert("❌ Erreur lors de l'approbation.");
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm("Voulez-vous vraiment refuser cette demande ?")) return;
    try {
      await plotService.rejectRequest(requestId);
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'rejected' } : req));
      alert("✅ Demande refusée.");
    } catch {
      alert("❌ Erreur lors du refus.");
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm("Supprimer cette demande ? Cette action est irréversible.")) return;
    try {
      await plotService.deleteRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert("✅ Demande supprimée.");
    } catch {
      alert("❌ Erreur lors de la suppression.");
    }
  };

  const resetForm = () => {
    setEditingPlot(null);
    setNewPlot({
      name: "",
      surface: "",
      soil_type: "",
      image: "",
      status: "available",
      _file: undefined,
    });
  };

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch = plot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || plot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const filteredRequests = useMemo(() => {
    let filtered = requests;
    if (requestFilter !== 'all') {
      filtered = filtered.filter(req => req.status === requestFilter);
    }
    // Vous pouvez ajouter un filtre par nom ici si vous le souhaitez
    return filtered;
  }, [requests, requestFilter]);


  // --- Affichage conditionnel ---
  if (loading) {
    return <div className="text-center p-10">Chargement...</div>;
  }
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 m-4" role="alert">
        <div className="flex">
          <div><AlertTriangle className="h-6 w-6 text-red-500 mr-4" /></div>
          <div><p className="font-bold">Erreur d'accès</p><p>{error}</p></div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold text-gray-800">Gestion du Jardin Partagé</h1>

      {/* NAVIGUATION DOUBLE VUE */}
      <div className="flex gap-2 border-b">
        <Button variant={adminView === 'plots' ? 'default' : 'ghost'} onClick={() => setAdminView('plots')} className={adminView === 'plots' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : "text-gray-600 hover:bg-gray-100"}>
          <MapPin className="h-4 w-4 mr-2" /> Gérer les Parcelles
        </Button>
        <Button variant={adminView === 'requests' ? 'default' : 'ghost'} onClick={() => setAdminView('requests')} className={adminView === 'requests' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : "text-gray-600 hover:bg-gray-100"}>
          <List className="h-4 w-4 mr-2" /> Gérer les Demandes ({requests.filter(r => r.status === 'pending').length})
        </Button>
      </div>

      {/* VUE DES PARCELLES */}
      {adminView === 'plots' && (
        <>
          {/* TITRE ET BOUTON AJOUTER */}
          <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Liste des Parcelles <Badge className="ml-2 bg-[#4CAF50]">{plots.length}</Badge>
            </h2>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded-xl shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" /> Ajouter une Parcelle
            </Button>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher une parcelle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl focus:border-[#4CAF50] focus:ring-[#4CAF50]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} className={statusFilter === "all" ? "bg-[#4CAF50] hover:bg-[#2E7D32] rounded-xl" : "rounded-xl"}>Toutes</Button>
                <Button variant={statusFilter === "occupied" ? "default" : "outline"} onClick={() => setStatusFilter("occupied")} className={statusFilter === "occupied" ? "bg-[#4CAF50] hover:bg-[#2E7D32] rounded-xl" : "rounded-xl"}>Occupées</Button>
                <Button variant={statusFilter === "available" ? "default" : "outline"} onClick={() => setStatusFilter("available")} className={statusFilter === "available" ? "bg-[#4CAF50] hover:bg-[#2E7D32] rounded-xl" : "rounded-xl"}>Disponibles</Button>
              </div>
            </div>
          </div>

          {/* Grille des parcelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {filteredPlots.map((plot) => (
              <PlotCard
                key={plot.id}
                plot={plot}
                onDelete={handleDeletePlot}
                onEdit={(plotToEdit) => {
                  setNewPlot({
                    name: plotToEdit.name ?? "",
                    surface: String(plotToEdit.surface ?? ""),
                    soil_type: plotToEdit.soil_type ?? "",
                    image: typeof plotToEdit.image === "string" ? plotToEdit.image : "",
                    status: plotToEdit.status ?? "available",
                    _file: undefined,
                  });
                  setEditingPlot(plotToEdit);
                  setIsAddDialogOpen(true);
                }}
                onClick={() => {
                  setSelectedPlot(plot);
                  setIsViewDialogOpen(true);
                }}
              />
            ))}
          </div>

          {/* Message vide */}
          {filteredPlots.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0] shadow-sm mt-6">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune parcelle trouvée</p>
            </div>
          )}
        </>
      )}


      {/* NOUVELLE VUE DES DEMANDES */}
      {adminView === 'requests' && (
        <section className="space-y-4 pt-4">
         <h2 className="text-lg font-semibold text-gray-800">
            {requestFilter === 'pending' ? 'Demandes en Attente' : requestFilter === 'approved' ? 'Demandes Approuvées' : requestFilter === 'rejected' ? 'Demandes Refusées' : 'Toutes les Demandes'}

          </h2>
          {/* Filtres pour les demandes */}
          <div className="flex gap-2">
            <Button variant={requestFilter === 'pending' ? 'default' : 'outline'} onClick={() => setRequestFilter('pending')} className={requestFilter === 'pending' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : ""}>En Attente ({requests.filter(r => r.status === 'pending').length})</Button>
            <Button variant={requestFilter === 'approved' ? 'default' : 'outline'} onClick={() => setRequestFilter('approved')} className={requestFilter === 'approved' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : ""}>Approuvées</Button>
            <Button variant={requestFilter === 'rejected' ? 'default' : 'outline'} onClick={() => setRequestFilter('rejected')} className={requestFilter === 'rejected' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : ""}>Refusées</Button>
            <Button variant={requestFilter === 'all' ? 'default' : 'outline'} onClick={() => setRequestFilter('all')} className={requestFilter === 'all' ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : ""}>Toutes</Button>
          </div>

          {/* Liste des demandes */}
          {filteredRequests.length === 0 ? (
            <p className="text-gray-500 italic p-4 bg-white rounded-lg shadow border">Aucune demande dans ce statut.</p>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow border">
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <li key={req.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{req.memberName}</p>
                      <p className="text-sm text-gray-600">Parcelle: <span className="font-bold">{req.plot?.name || `ID ${req.plotId}`}</span></p>
                      <p className="text-xs text-gray-400">Demandé le {new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <Button size="icon" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(req.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleReject(req.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {req.status === 'approved' && <Badge className="bg-green-100 text-green-800">Approuvée</Badge>}
                      {req.status === 'rejected' && <Badge variant="destructive">Refusée</Badge>}
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteRequest(req.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}


      {/* Dialogue Ajouter / Modifier */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#2E7D32] flex items-center gap-2">
              {editingPlot ? "🍃 Modifier la parcelle" : "🌿 Ajouter une parcelle"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            {/* Nom + Surface */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Nom</label>
                <Input
                  value={newPlot.name}
                  onChange={(e) => setNewPlot({ ...newPlot, name: e.target.value })}
                  placeholder="Ex : Parcelle A1"
                  className="rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Surface (m²)</label>
                <Input
                  type="number"
                  value={newPlot.surface}
                  onChange={(e) => setNewPlot({ ...newPlot, surface: e.target.value })}
                  placeholder="Ex : 80"
                  className="rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Type de sol */}
            <div>
              <label className="text-xs font-medium text-gray-600">Type de sol</label>
              <select
                value={newPlot.soil_type}
                onChange={(e) => setNewPlot({ ...newPlot, soil_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4CAF50] outline-none"
              >
                <option value="">-- Choisir --</option>
                {soilTypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Image */}
            <div>
              <label className="text-xs font-medium text-gray-600">Image</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="URL de l'image"
                  value={newPlot.image}
                  onChange={(e) => setNewPlot({ ...newPlot, image: e.target.value })}
                  className="rounded-lg text-sm flex-1"
                />
                <span className="text-sm text-gray-500 font-medium">ou</span>
                <label className="cursor-pointer bg-[#4CAF50]/10 hover:bg-[#4CAF50]/20 text-[#2E7D32] text-sm font-medium px-3 py-2 rounded-lg border border-[#4CAF50]/30 transition-all">
                  Choisir un fichier
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {newPlot._file && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={URL.createObjectURL(newPlot._file)}
                    alt="Aperçu"
                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* 🪄 Bouton Ajouter / Modifier */}
            <Button
              onClick={() => {
                if (editingPlot) handleUpdatePlot(editingPlot.id!);
                else handleAddPlot();
              }}
              className="w-full py-2 rounded-lg bg-[#4CAF50] hover:bg-[#2E7D32] text-white text-sm font-semibold"
            >
              {editingPlot ? "Mettre à jour la parcelle" : "Ajouter la parcelle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Dialogue Vue détaillée */}
    
        <Dialog 
                open={isViewDialogOpen} 
                onOpenChange={(open: boolean) => {
                    setIsViewDialogOpen(open);
                    if (!open) setSelectedPlot(null);
                }}
            >
                <DialogContent className="max-w-xl p-0 bg-white shadow-2xl overflow-hidden rounded-2xl">
                    {selectedPlot && (
                        <>
                            <DialogHeader className="sr-only">
                                <DialogTitle>Détails de la parcelle {selectedPlot.name}</DialogTitle>
                                <DialogDescription>
                                  Informations détaillées concernant la parcelle {selectedPlot.name}, son statut et son occupant.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-64">
                                <img src={typeof selectedPlot.image === "string" ? selectedPlot.image : "https://via.placeholder.com/300x200?text=No+Image"} alt={selectedPlot.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedPlot.name}</h2>
                                    <div className="flex gap-2">
                                        <Badge className={
                                            (selectedPlot.isCurrentUserOccupant) ? "bg-[#4CAF50] border-2 border-white" : 
                                            (selectedPlot.requestStatus === "pending") ? "bg-yellow-600 border-2 border-white" : 
                                            "bg-gray-500 border-2 border-white"
                                        }>
                                            { (selectedPlot.isCurrentUserOccupant) ? "Ma Parcelle" 
                                            : selectedPlot.requestStatus === "pending" ? "Demande en Attente"
                                            : selectedPlot.status === "occupied" ? "Occupée" : "Disponible"}
                                        </Badge>
                                        {selectedPlot.current_plant && (
                                            <Badge className="bg-white text-gray-800 font-semibold">{selectedPlot.plant_emoji} {selectedPlot.current_plant}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Informations Clés</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <MapPin className="h-6 w-6 text-[#2E7D32]" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Superficie</p>
                                            <p className="font-semibold">{selectedPlot.surface} m²</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <Leaf className="h-6 w-6 text-yellow-700" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Type de Sol</p>
                                            <p className="font-semibold">{selectedPlot.soil_type}</p>
                                        </div>
                                    </div>
                                    {selectedPlot.occupant && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 col-span-2">
                                            <Send className="h-6 w-6 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Occupant</p>
                                                <p className="font-semibold">
                                                    {selectedPlot.occupant} 
                                                    {selectedPlot.requestStatus === "pending" && " (Demande en attente)"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="p-4 bg-gray-100 rounded-b-2xl">
                                <Button onClick={() => setIsViewDialogOpen(false)} className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-semibold rounded-xl px-6 py-2 shadow-lg">Fermer</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
    </div>

  );
}