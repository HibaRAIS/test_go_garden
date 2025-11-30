import { MapPin, User, Trash, Edit } from "lucide-react";
import { Plot } from "../lib/plots";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import React, { ReactNode } from "react"; 


interface PlotCardProps {
    plot: Plot; 
    onClick?: () => void;
    onDelete?: (id: number) => void;
    onEdit?: (plot: Plot) => void;
    // NOUVELLE PROPRIÉTÉ
    requestStatusBadge?: ReactNode; 
    // PROPRIÉTÉ EXISTANTE
    actionButton?: ReactNode; 
}

export function PlotCard({ plot, onClick, onDelete, onEdit, actionButton, requestStatusBadge }: PlotCardProps) {
    if (!plot || !plot.name) return null;

    const hasAdminActions = onEdit || onDelete; 

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl overflow-hidden border border-[#E0E0E0] hover:shadow-lg transition-all cursor-pointer group relative"
        >
            <div className="relative h-48">
                <img
                    src={
                        typeof plot.image === "string"
                            ? plot.image
                            : "https://via.placeholder.com/300x200?text=No+Image" 
                    }
                    alt={plot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                />

                {/* --- AFFICHAGE DES BADGES ET BOUTONS --- */}
                
                {/* AFFICHEUR DE STATUT (GAUCHE) */}
                <div className="absolute top-3 left-3 z-10">
                    {/* ✅ Logique corrigée : Le badge de statut de DEMANDE remplace le badge d'occupation */}
                    {requestStatusBadge ? (
                        requestStatusBadge
                    ) : (
                        // Sinon, on affiche le badge standard "Occupée" / "Disponible"
                        <Badge
                            variant={plot.status === "occupied" ? "default" : "secondary"}
                            className={plot.status === "occupied" ? "bg-[#4CAF50]" : "bg-gray-400"} 
                        >
                            {plot.status === "occupied" ? "Occupée" : "Disponible"}
                        </Badge>
                    )}
                </div>

                {/* AFFICHEUR D'ACTION (DROITE) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {hasAdminActions ? (
                        <>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        onEdit(plot);
                                    }}
                                    className="bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md flex items-center justify-center"
                                    title="Modifier"
                                >
                                    <Edit className="h-4 w-4" /> 
                                </Button>
                            )}
                            {onDelete && plot.id !== undefined && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        onDelete(plot.id!);
                                    }}
                                    className="bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md flex items-center justify-center"
                                    title="Supprimer"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    ) : (
                        // Affiche le bouton "Demander" s'il est fourni
                        actionButton
                    )}
                </div>
            </div>

            {/* Contenu texte */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-gray-900 mb-1 font-medium">{plot.name}</h3>
                        <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">{plot.surface} m²</span>
                        </div>
                    </div>
                    {plot.plant_emoji && <span className="text-2xl">{plot.plant_emoji}</span>}
                </div>

                {plot.occupant && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4 text-[#4CAF50]" />
                        <span className="text-xs">{plot.occupant}</span>
                    </div>
                )}

                {plot.current_plant && (
                    <div className="mt-2 pt-2 border-t border-[#E0E0E0]">
                        <p className="text-xs text-gray-600">Culture actuelle</p>
                        <p className="text-[#2E7D32] font-medium">{plot.current_plant}</p>
                    </div>
                )}
            </div>
        </div>
    );
}