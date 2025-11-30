import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { PlantCard } from "../../components/PlantCard";
import { plants as initialPlants, Plant } from "../../lib/mock-data";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

export function Plants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPlants = initialPlants.filter(
    (plant) =>
      plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.latinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.season.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Catalogue de Plantes</h1>
          <p className="text-gray-600">
            {filteredPlants.length} plante{filteredPlants.length > 1 ? "s" : ""}{" "}
            disponible{filteredPlants.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une plante
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une plante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Plants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onClick={() => handlePlantClick(plant)}
          />
        ))}
      </div>

      {filteredPlants.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
          <p className="text-gray-500">Aucune plante trouvée</p>
        </div>
      )}

      {/* Plant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlant?.commonName}</DialogTitle>
          </DialogHeader>

          {selectedPlant && (
            <div className="space-y-6">
              <img
                src={selectedPlant.image}
                alt={selectedPlant.commonName}
                className="w-full h-64 object-cover rounded-xl"
              />

              <div>
                <p className="text-sm text-gray-500 italic mb-4">
                  {selectedPlant.latinName}
                </p>
                <p className="text-gray-700">{selectedPlant.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F5F0] rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Saison</p>
                  <p className="text-gray-900">{selectedPlant.season}</p>
                </div>
                <div className="bg-[#F8F5F0] rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Arrosage</p>
                  <p className="text-gray-900">{selectedPlant.watering}</p>
                </div>
                <div className="bg-[#F8F5F0] rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">
                    Période de plantation
                  </p>
                  <p className="text-gray-900">
                    {selectedPlant.plantingPeriod}
                  </p>
                </div>
                <div className="bg-[#F8F5F0] rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">
                    Période de récolte
                  </p>
                  <p className="text-gray-900">{selectedPlant.harvestPeriod}</p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3">Conseils d'entretien</h4>
                <ul className="space-y-2">
                  {selectedPlant.care.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#4CAF50] mt-1.5" />
                      <span className="text-gray-700 flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/10 rounded-xl p-4">
                <h4 className="text-gray-900 mb-2">Partager vos conseils</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Vous avez des astuces pour cultiver cette plante ?
                  Partagez-les avec la communauté !
                </p>
                <Button className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]">
                  Ajouter un conseil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
